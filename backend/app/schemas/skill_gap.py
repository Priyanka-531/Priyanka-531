from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class SkillGapAnalyzeRequest(BaseModel):
    job_id: UUID
    resume_id: Optional[UUID] = None

class SkillGapResponse(BaseModel):
    id: UUID
    user_id: UUID
    job_id: UUID
    resume_id: Optional[UUID] = None
    match_score: float
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    partially_matched_skills: List[str] = []
    unmet_requirements: List[str] = []
    strengths_to_highlight: List[str] = []
    recommended_actions: List[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
