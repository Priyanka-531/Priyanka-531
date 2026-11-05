import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class SkillBase(BaseModel):
    name: str
    category: str

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserSkillCreate(BaseModel):
    skill_id: Optional[uuid.UUID] = None
    skill_name: Optional[str] = None
    proficiency_level: str = "Beginner" # Beginner, Intermediate, Advanced
    years_of_experience: float = 0.0
    is_learning: bool = False

class UserSkillUpdate(BaseModel):
    proficiency_level: Optional[str] = None
    years_of_experience: Optional[float] = None
    is_learning: Optional[bool] = None

class UserSkillResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    skill_id: uuid.UUID
    skill: SkillResponse
    proficiency_level: str
    years_of_experience: float
    is_learning: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
