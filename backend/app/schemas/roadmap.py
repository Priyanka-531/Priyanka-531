from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from datetime import datetime

class RoadmapGenerateRequest(BaseModel):
    target_role: Optional[str] = Field(None, max_length=100)
    missing_skills: Optional[List[str]] = None
    daily_hours: Optional[int] = Field(2, ge=1, le=12)
    total_weeks: Optional[int] = Field(4, ge=1, le=12)

class RoadmapTaskUpdateRequest(BaseModel):
    is_completed: bool

class RoadmapTaskResponse(BaseModel):
    id: UUID
    roadmap_id: UUID
    week_number: int
    day_number: int
    title: str
    explanation: str
    skill_category: str
    estimated_duration_minutes: int
    resource_name: Optional[str] = None
    resource_url: Optional[str] = None
    is_completed: bool
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RoadmapResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    target_role: str
    summary: Optional[str] = None
    total_weeks: int
    daily_hours: int
    created_at: datetime
    tasks: List[RoadmapTaskResponse] = []

    model_config = ConfigDict(from_attributes=True)
