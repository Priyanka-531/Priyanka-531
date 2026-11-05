import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.schemas.skill import SkillResponse, UserSkillCreate, UserSkillUpdate, UserSkillResponse

router = APIRouter(tags=["Skills"])

@router.get("/skills", response_model=List[SkillResponse])
def get_available_skills(
    category: Optional[str] = None,
    q: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve catalog of available skills for user selection."""
    query = db.query(Skill)
    if category:
        query = query.filter(Skill.category == category)
    if q:
        query = query.filter(Skill.name.ilike(f"%{q}%"))
    return query.order_by(Skill.category, Skill.name).all()

@router.get("/profile/skills", response_model=List[UserSkillResponse])
def get_user_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve skills owned by authenticated user."""
    return db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()

@router.post("/profile/skills", response_model=UserSkillResponse, status_code=status.HTTP_201_CREATED)
def add_user_skill(
    skill_in: UserSkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a skill to authenticated user profile."""
    target_skill = None
    if skill_in.skill_id:
        target_skill = db.query(Skill).filter(Skill.id == skill_in.skill_id).first()
    elif skill_in.skill_name:
        target_skill = db.query(Skill).filter(Skill.name.ilike(skill_in.skill_name.strip())).first()
        if not target_skill:
            # Dynamically register custom skill if not present
            target_skill = Skill(name=skill_in.skill_name.strip(), category="Other")
            db.add(target_skill)
            db.commit()
            db.refresh(target_skill)

    if not target_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found. Please provide valid skill_id or skill_name."
        )

    # Check for duplicate
    existing = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_id == target_skill.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Skill '{target_skill.name}' is already added to your profile."
        )

    user_skill = UserSkill(
        user_id=current_user.id,
        skill_id=target_skill.id,
        proficiency_level=skill_in.proficiency_level,
        years_of_experience=skill_in.years_of_experience,
        is_learning=skill_in.is_learning
    )
    db.add(user_skill)
    db.commit()
    db.refresh(user_skill)
    return user_skill

@router.put("/profile/skills/{user_skill_id}", response_model=UserSkillResponse)
@router.patch("/profile/skills/{user_skill_id}", response_model=UserSkillResponse)
def update_user_skill(
    user_skill_id: uuid.UUID,
    skill_in: UserSkillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update proficiency or experience of an owned skill."""
    user_skill = db.query(UserSkill).filter(UserSkill.id == user_skill_id).first()
    if not user_skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User skill entry not found.")

    if user_skill.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Cannot edit another user's skill.")

    update_data = skill_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(user_skill, field, val)

    db.commit()
    db.refresh(user_skill)
    return user_skill

@router.delete("/profile/skills/{user_skill_id}", status_code=status.HTTP_200_OK)
def delete_user_skill(
    user_skill_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a skill from authenticated user profile."""
    user_skill = db.query(UserSkill).filter(UserSkill.id == user_skill_id).first()
    if not user_skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User skill entry not found.")

    if user_skill.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Cannot remove another user's skill.")

    db.delete(user_skill)
    db.commit()
    return {"detail": "Skill successfully removed from profile."}
