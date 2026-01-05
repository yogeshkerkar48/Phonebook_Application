from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
from rapidfuzz import process, fuzz

import crud
import schemas
import auth
import models
from database import get_db

router = APIRouter()

# Authentication Endpoints

@router.post("/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED, tags=["auth"])
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@router.post("/login", response_model=schemas.Token, tags=["auth"])
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=schemas.User, tags=["auth"])
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.post("/2fa/setup", tags=["auth"])
def setup_2fa(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.is_2fa_enabled:
        return {"message": "2FA already enabled"}
    
    secret = auth.generate_totp_secret()
    # Temporarily store secret or just return it for verification
    # For simplicity, we update the user but don't set is_2fa_enabled until verified
    current_user.otp_secret = secret
    db.commit()
    
    uri = auth.get_totp_uri(secret, current_user.email)
    return {"secret": secret, "uri": uri}

@router.post("/2fa/verify-setup", tags=["auth"])
def verify_setup_2fa(
    code: str = Body(..., embed=True),
    secret: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if auth.verify_totp(secret, code):
        current_user.is_2fa_enabled = True
        current_user.otp_secret = secret # Ensure it's saved
        db.commit()
        return {"message": "2FA enabled successfully"}
    raise HTTPException(status_code=400, detail="Invalid code")

@router.post("/2fa/verify-login", tags=["auth"])
def verify_login_2fa(
    code: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if not current_user.is_2fa_enabled:
        return {"message": "2FA not enabled"}
    
    if not auth.verify_totp(current_user.otp_secret, code):
        raise HTTPException(status_code=400, detail="Invalid code")
    
    return {"message": "Verification successful"}

# Contact Endpoints

@router.post("/contacts/", response_model=schemas.Contact, status_code=status.HTTP_201_CREATED, tags=["contacts"])
def create_contact(
    contact: schemas.ContactCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Create a new contact"""
    return crud.create_contact(db=db, contact=contact, user_id=current_user.id)

@router.get("/contacts/", response_model=schemas.ContactPaginatedResponse, tags=["contacts"])
def read_contacts(
    page: int = 1, 
    page_size: int = 20, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get all contacts with pagination"""
    # Calculate skip/limit
    skip = (page - 1) * page_size
    limit = page_size
    
    contacts, total = crud.get_contacts(db=db, user_id=current_user.id, skip=skip, limit=limit)
    
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0
    
    return {
        "data": contacts,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages
    }

@router.get("/contacts/{contact_id}", response_model=schemas.Contact, tags=["contacts"])
def read_contact(
    contact_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Get a single contact by ID"""
    db_contact = crud.get_contact(db=db, contact_id=contact_id, user_id=current_user.id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact

@router.put("/contacts/{contact_id}", response_model=schemas.Contact, tags=["contacts"])
def update_contact(
    contact_id: int, 
    contact: schemas.ContactUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Update a contact"""
    db_contact = crud.update_contact(db=db, contact_id=contact_id, contact=contact, user_id=current_user.id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact

@router.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["contacts"])
def delete_contact(
    contact_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Delete a contact"""
    success = crud.delete_contact(db=db, contact_id=contact_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Contact not found")
    return None

# Search Endpoint

@router.get("/search", response_model=schemas.ContactSearch, tags=["search"])
def search_contacts(
    q: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Search contacts using fuzzy matching"""
    # Fetch all contacts for the user
    # Note: search might need optimization later, currently fetches all
    all_contacts, _ = crud.get_contacts(db=db, user_id=current_user.id, limit=1000)
    
    if not q or not q.strip():
        return {
            "results": all_contacts,
            "query": q,
            "total": len(all_contacts)
        }
    
    # For short queries (1-2 characters), use simple case-insensitive contains matching
    if len(q) <= 2:
        q_lower = q.lower()
        matched_contacts = [
            c for c in all_contacts 
            if q_lower in c.name.lower() 
            or q_lower in c.phone 
            or (c.email and q_lower in c.email.lower())
        ]
    else:
        # For longer queries, use fuzzy matching
        choices = {c.id: f"{c.name} {c.phone} {c.email or ''}" for c in all_contacts}
        results = process.extract(q, choices, limit=10, scorer=fuzz.token_set_ratio)
        # Lower threshold for better matching
        matched_ids = [res[2] for res in results if res[1] > 30]
        matched_contacts = [c for c in all_contacts if c.id in matched_ids]
    
    return {
        "results": matched_contacts,
        "query": q,
        "total": len(matched_contacts)
    }
