from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional, Union
from datetime import datetime
import re

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Union[str, None] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password should be of 8 or more characters')
        return v

class UserLogin(UserBase):
    password: str

class User(UserBase):
    id: int
    is_2fa_enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Contact Schemas
class ContactBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Contact name")
    phone: str = Field(..., description="Contact phone number")
    email: Optional[str] = Field(None, description="Contact email address")
    address: Optional[str] = Field(None, max_length=255, description="Contact address")

class ContactCreate(ContactBase):
    phone: str = Field(..., description="Contact phone number (10 digits)")
    email: Optional[str] = Field(None, description="Contact email address")

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not re.match(r'^\d{10}$', v):
            raise ValueError('number should be 10 digit')
        return v

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v and not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', v):
            raise ValueError('email should be in valid format')
        return v

class ContactUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Contact name")
    phone: Optional[str] = Field(None, description="Contact phone number (10 digits)")
    email: Optional[str] = Field(None, description="Contact email address")
    address: Optional[str] = Field(None, max_length=255, description="Contact address")

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v and not re.match(r'^\d{10}$', v):
            raise ValueError('number should be 10 digit')
        return v

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: Optional[str]) -> Optional[str]:
        if v and not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', v):
            raise ValueError('email should be in valid format')
        return v

class Contact(ContactBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ContactSearch(BaseModel):
    results: List[Contact]
    query: str
    total: int

class ContactPaginatedResponse(BaseModel):
    data: List[Contact]
    page: int
    page_size: int
    total: int
    total_pages: int
