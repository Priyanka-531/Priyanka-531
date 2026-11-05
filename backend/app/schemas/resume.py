from typing import List, Optional, Any, Dict
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class ResumeAnalysisResponse(BaseModel):
    id: UUID
    resume_id: UUID
    candidate_name: Optional[str] = None
    professional_summary: Optional[str] = None
    technical_skills: List[str] = []
    soft_skills: List[str] = []
    education: List[Dict[str, Any]] = []
    experience_projects: List[Dict[str, Any]] = []
    strengths: List[str] = []
    missing_sections: List[str] = []
    improvement_suggestions: List[str] = []
    is_ai_generated: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeResponse(BaseModel):
    id: UUID
    user_id: UUID
    filename: str
    original_filename: str
    file_size: int
    is_scanned: bool = False
    created_at: datetime
    analysis: Optional[ResumeAnalysisResponse] = None

    model_config = ConfigDict(from_attributes=True)
