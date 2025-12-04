from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db

router = APIRouter(prefix="/contacts", tags=["contacts"])

@router.post("/", response_model=schemas.Contact, status_code=status.HTTP_201_CREATED)
def create_contact(contact: schemas.ContactCreate, db: Session = Depends(get_db)):
    """Create a new contact"""
    return crud.create_contact(db=db, contact=contact)

@router.get("/", response_model=List[schemas.Contact])
def read_contacts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all contacts"""
    contacts = crud.get_contacts(db=db, skip=skip, limit=limit)
    return contacts

@router.get("/{contact_id}", response_model=schemas.Contact)
def read_contact(contact_id: int, db: Session = Depends(get_db)):
    """Get a single contact by ID"""
    db_contact = crud.get_contact(db=db, contact_id=contact_id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact

@router.put("/{contact_id}", response_model=schemas.Contact)
def update_contact(contact_id: int, contact: schemas.ContactUpdate, db: Session = Depends(get_db)):
    """Update a contact"""
    db_contact = crud.update_contact(db=db, contact_id=contact_id, contact=contact)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return db_contact

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    """Delete a contact"""
    success = crud.delete_contact(db=db, contact_id=contact_id)
    if not success:
        raise HTTPException(status_code=404, detail="Contact not found")
    return None
