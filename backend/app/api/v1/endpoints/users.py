from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserRegister, UserResponse
from app.services.auth_service import register_user
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])

@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create User",
    description="Create a new user account with full name, email, and password."
)
def create_user(
    user_in: UserRegister,
    db: Session = Depends(get_db)
):
    """
    Create a new user account directly.
    """
    return register_user(
        db=db,
        user_in=user_in
    )

@router.get("/profile", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    Fetch user profile details.
    """
    return current_user
