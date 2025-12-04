from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas

def get_contact(db: Session, contact_id: int) -> Optional[models.Contact]:
    """Get a single contact by ID"""
    return db.query(models.Contact).filter(models.Contact.id == contact_id).first()

def get_contacts(db: Session, skip: int = 0, limit: int = 100) -> List[models.Contact]:
    """Get all contacts with pagination"""
    return db.query(models.Contact).offset(skip).limit(limit).all()

def create_contact(db: Session, contact: schemas.ContactCreate) -> models.Contact:
    """Create a new contact"""
    db_contact = models.Contact(
        name=contact.name,
        phone=contact.phone,
        email=contact.email,
        address=contact.address
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

def update_contact(db: Session, contact_id: int, contact: schemas.ContactUpdate) -> Optional[models.Contact]:
    """Update an existing contact"""
    db_contact = get_contact(db, contact_id)
    if db_contact is None:
        return None
    
    # Update only provided fields
    update_data = contact.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_contact, key, value)
    
    db.commit()
    db.refresh(db_contact)
    return db_contact

def delete_contact(db: Session, contact_id: int) -> bool:
    """Delete a contact"""
    db_contact = get_contact(db, contact_id)
    if db_contact is None:
        return False
    
    db.delete(db_contact)
    db.commit()
    return True
