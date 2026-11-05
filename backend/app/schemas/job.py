from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from datetime import datetime

class JobAnalyzeRequest(BaseModel):
    title: Optional[str] = Field(None, max_length=150)
    company_name: Optional[str] = Field(None, max_length=150)
    raw_text: str = Field(..., min_length=20, max_length=50000)

class JobResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    company_name: Optional[str] = None
    raw_text: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    tools_frameworks: List[str] = []
    experience_expectations: Optional[str] = None
    education_requirements: Optional[str] = None
    responsibilities: List[str] = []
    teamwork_communication: List[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
