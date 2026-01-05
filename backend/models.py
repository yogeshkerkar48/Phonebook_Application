from sqlalchemy import Column, Integer, String, DateTime, func, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_2fa_enabled = Column(Boolean, default=False)
    otp_secret = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    contacts = relationship("Contact", back_populates="owner")

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=True)
    address = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="contacts")

    # Unique constraint: each user cannot have duplicate phone numbers
    __table_args__ = (
        UniqueConstraint('user_id', 'phone', name='uq_user_phone'),
    )

    def __repr__(self):
        return f"<Contact(id={self.id}, name='{self.name}', phone='{self.phone}', created_at='{self.created_at}')>"
