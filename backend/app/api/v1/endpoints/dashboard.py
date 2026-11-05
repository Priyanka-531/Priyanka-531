from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.job import JobDescription
from app.models.skill_gap import SkillGapAnalysis
from app.models.roadmap import Roadmap, RoadmapTask
from app.models.career_profile import CareerProfile
from app.models.career_goal import CareerGoal
from app.schemas.dashboard import DashboardSummaryResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns authentic dashboard metrics aggregated from the database for the user.
    """
    # 1. Target Role: Check primary career goal, then career profile
    target_role = None
    goal = db.query(CareerGoal).filter(CareerGoal.user_id == current_user.id).order_by(CareerGoal.is_primary.desc(), CareerGoal.created_at.desc()).first()
    if goal:
        target_role = goal.target_role
    else:
        profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
        if profile and profile.target_role:
            target_role = profile.target_role

    # 2. Latest Resume
    latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()

    # 3. Latest Job
    latest_job = db.query(JobDescription).filter(JobDescription.user_id == current_user.id).order_by(JobDescription.created_at.desc()).first()

    # 4. Latest Skill Gap Analysis
    latest_skill_gap = db.query(SkillGapAnalysis).filter(SkillGapAnalysis.user_id == current_user.id).order_by(SkillGapAnalysis.created_at.desc()).first()

    # 5. Active Roadmap
    active_roadmap = db.query(Roadmap).filter(Roadmap.user_id == current_user.id).order_by(Roadmap.created_at.desc()).first()

    # 6. Tasks and progress
    tasks_total = 0
    tasks_completed = 0
    progress_pct = 0.0

    if active_roadmap and active_roadmap.tasks:
        tasks_total = len(active_roadmap.tasks)
        tasks_completed = sum(1 for t in active_roadmap.tasks if t.is_completed)
        if tasks_total > 0:
            progress_pct = round((tasks_completed / tasks_total) * 100.0, 1)

    # 7. Authentic Next Action Suggestion
    if not latest_resume:
        suggested_action = "Upload your PDF resume to unlock automated AI parsing and skills extraction."
    elif not latest_job:
        suggested_action = "Paste a target job posting in Jobs to analyze real industry expectations."
    elif not latest_skill_gap:
        suggested_action = "Run a Skill Gap analysis to calculate your exact match score and identify gaps."
    elif not active_roadmap:
        suggested_action = "Generate a personalized study roadmap to start bridging your skill gaps."
    elif tasks_completed < tasks_total:
        suggested_action = f"Complete your next pending task in Week {active_roadmap.tasks[tasks_completed].week_number}."
    else:
        suggested_action = "Congratulations! You have completed all roadmap tasks. Update your resume and review new roles!"

    return DashboardSummaryResponse(
        target_role=target_role,
        latest_resume=latest_resume,
        latest_job=latest_job,
        latest_skill_gap=latest_skill_gap,
        active_roadmap=active_roadmap,
        tasks_completed_count=tasks_completed,
        tasks_total_count=tasks_total,
        roadmap_progress_percentage=progress_pct,
        suggested_next_action=suggested_action
    )
