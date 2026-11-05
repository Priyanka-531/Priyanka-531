import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator

class UserRegister(BaseModel):
    """Payload sent by client when creating a new account."""
    full_name: str = Field(..., min_length=2, max_length=100, examples=["Jane Doe"])
    email: EmailStr = Field(..., examples=["jane@example.com"])
    password: str = Field(..., min_length=6, max_length=100, examples=["secretpassword123"])

    @field_validator("email", mode="before")
    def normalize_email(cls, v):
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("full_name", mode="before")
    def normalize_full_name(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v

class UserLogin(BaseModel):
    """Payload sent by client when logging in."""
    email: str = Field(..., examples=["jane@example.com"])
    password: str = Field(..., examples=["secretpassword123"])

    @field_validator("email", mode="before")
    def normalize_email(cls, v):
        if isinstance(v, str):
            return v.strip().lower()
        return v

class UserResponse(BaseModel):
    """Safe user details returned to frontend (NEVER includes password)."""
    id: uuid.UUID
    email: EmailStr
    full_name: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    """JWT response structure returned on successful login."""
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    """Payload extracted from validated JWT token."""
    sub: Optional[str] = None
