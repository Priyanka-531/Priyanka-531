import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class CareerProfileBase(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    current_year: Optional[str] = None
    cgpa: Optional[float] = None
    bio: Optional[str] = None
    experience_level: Optional[str] = None # Beginner, Intermediate, Advanced
    preferred_work_mode: Optional[str] = None # Remote, Hybrid, On-site
    preferred_locations: Optional[str] = None
    target_role: Optional[str] = None
    target_domain: Optional[str] = None

class CareerProfileCreate(CareerProfileBase):
    pass

class CareerProfileUpdate(CareerProfileBase):
    pass

class CareerProfileResponse(CareerProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    completion_percentage: int = 0

    model_config = ConfigDict(from_attributes=True)
