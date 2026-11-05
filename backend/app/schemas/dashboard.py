from typing import List, Optional
from pydantic import BaseModel
from app.schemas.resume import ResumeResponse
from app.schemas.job import JobResponse
from app.schemas.skill_gap import SkillGapResponse
from app.schemas.roadmap import RoadmapResponse

class DashboardSummaryResponse(BaseModel):
    target_role: Optional[str] = None
    latest_resume: Optional[ResumeResponse] = None
    latest_job: Optional[JobResponse] = None
    latest_skill_gap: Optional[SkillGapResponse] = None
    active_roadmap: Optional[RoadmapResponse] = None
    tasks_completed_count: int = 0
    tasks_total_count: int = 0
    roadmap_progress_percentage: float = 0.0
    suggested_next_action: str
