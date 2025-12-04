from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class ContactBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Contact name")
    phone: str = Field(..., min_length=1, max_length=20, description="Contact phone number")
    email: Optional[str] = Field(None, max_length=100, description="Contact email address")
    address: Optional[str] = Field(None, max_length=255, description="Contact address")

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Contact name")
    phone: Optional[str] = Field(None, min_length=1, max_length=20, description="Contact phone number")
    email: Optional[str] = Field(None, max_length=100, description="Contact email address")
    address: Optional[str] = Field(None, max_length=255, description="Contact address")

class Contact(ContactBase):
    id: int

    class Config:
        from_attributes = True
