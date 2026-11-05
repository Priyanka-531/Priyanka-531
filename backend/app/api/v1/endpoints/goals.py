import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.career_goal import CareerGoal
from app.schemas.career_goal import CareerGoalCreate, CareerGoalUpdate, CareerGoalResponse

router = APIRouter(prefix="/goals", tags=["Career Goals"])

@router.get("", response_model=List[CareerGoalResponse])
def get_user_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve career goals belonging to authenticated user."""
    return db.query(CareerGoal).filter(CareerGoal.user_id == current_user.id).order_by(CareerGoal.is_primary.desc(), CareerGoal.created_at.desc()).all()

@router.post("", response_model=CareerGoalResponse, status_code=status.HTTP_201_CREATED)
def create_career_goal(
    goal_in: CareerGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new career goal for authenticated user."""
    # If set as primary, un-primary existing goals
    if goal_in.is_primary:
        db.query(CareerGoal).filter(CareerGoal.user_id == current_user.id).update({"is_primary": False})

    # If first goal for user, default to primary
    user_goal_count = db.query(CareerGoal).filter(CareerGoal.user_id == current_user.id).count()
    is_primary = goal_in.is_primary or (user_goal_count == 0)

    data = goal_in.model_dump()
    data["is_primary"] = is_primary

    goal = CareerGoal(user_id=current_user.id, **data)
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.put("/{goal_id}", response_model=CareerGoalResponse)
@router.patch("/{goal_id}", response_model=CareerGoalResponse)
def update_career_goal(
    goal_id: uuid.UUID,
    goal_in: CareerGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing career goal."""
    goal = db.query(CareerGoal).filter(CareerGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career goal not found.")

    if goal.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Cannot edit another user's goal.")

    update_data = goal_in.model_dump(exclude_unset=True)

    if update_data.get("is_primary"):
        db.query(CareerGoal).filter(CareerGoal.user_id == current_user.id).update({"is_primary": False})

    for field, val in update_data.items():
        setattr(goal, field, val)

    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{goal_id}", status_code=status.HTTP_200_OK)
def delete_career_goal(
    goal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a career goal."""
    goal = db.query(CareerGoal).filter(CareerGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career goal not found.")

    if goal.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Cannot delete another user's goal.")

    db.delete(goal)
    db.commit()
    return {"detail": "Career goal successfully deleted."}
