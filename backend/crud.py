from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
import auth

# User CRUD
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Contact CRUD
def get_contact(db: Session, contact_id: int, user_id: int) -> Optional[models.Contact]:
    """Get a single contact by ID and User ID"""
    return db.query(models.Contact).filter(models.Contact.id == contact_id, models.Contact.user_id == user_id).first()

def get_contacts(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get all contacts for a user with pagination and sorting"""
    # Create base query
    query = db.query(models.Contact).filter(models.Contact.user_id == user_id)
    
    # Get total count
    total = query.count()
    
    # Get paginated results with sorting
    contacts = query.order_by(models.Contact.name.asc()).offset(skip).limit(limit).all()
    
    return contacts, total

def create_contact(db: Session, contact: schemas.ContactCreate, user_id: int) -> models.Contact:
    """Create a new contact for a user"""
    # Check if phone number already exists for this user
    existing_contact = db.query(models.Contact).filter(
        models.Contact.user_id == user_id,
        models.Contact.phone == contact.phone
    ).first()
    
    if existing_contact:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400, 
            detail=f"A contact with phone number {contact.phone} already exists"
        )
    
    db_contact = models.Contact(
        **contact.model_dump(),
        user_id=user_id
    )
    db.add(db_contact)
    try:
        db.commit()
        db.refresh(db_contact)
    except Exception as e:
        db.rollback()
        # Check for duplicate entry error (MySQL error code 1062)
        if "1062" in str(e) or "Duplicate entry" in str(e):
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail=f"A contact with phone number {contact.phone} already exists")
        raise e
    return db_contact

def update_contact(db: Session, contact_id: int, contact: schemas.ContactUpdate, user_id: int) -> Optional[models.Contact]:
    """Update an existing contact for a user"""
    db_contact = get_contact(db, contact_id, user_id)
    if db_contact is None:
        return None
    
    # Update only provided fields
    update_data = contact.model_dump(exclude_unset=True)
    
    # If phone is being updated, check for duplicates
    if 'phone' in update_data:
        existing_contact = db.query(models.Contact).filter(
            models.Contact.user_id == user_id,
            models.Contact.phone == update_data['phone'],
            models.Contact.id != contact_id  # Exclude current contact
        ).first()
        
        if existing_contact:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=400, 
                detail=f"A contact with phone number {update_data['phone']} already exists"
            )
    
    for key, value in update_data.items():
        setattr(db_contact, key, value)
    
    try:
        db.commit()
        db.refresh(db_contact)
    except Exception as e:
        db.rollback()
        if "1062" in str(e) or "Duplicate entry" in str(e):
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail=f"A contact with this phone number already exists")
        raise e
    return db_contact

def delete_contact(db: Session, contact_id: int, user_id: int) -> bool:
    """Delete a contact for a user"""
    db_contact = get_contact(db, contact_id, user_id)
    if db_contact is None:
        return False
    
    db.delete(db_contact)
    db.commit()
    return True
