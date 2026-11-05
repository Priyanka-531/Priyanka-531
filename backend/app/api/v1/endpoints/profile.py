from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.career_profile import CareerProfile
from app.schemas.career_profile import CareerProfileCreate, CareerProfileUpdate, CareerProfileResponse

router = APIRouter(prefix="/profile", tags=["Career Profile"])

def calculate_completion_percentage(profile: CareerProfile) -> int:
    """Calculates profile completion percentage dynamically from non-empty fields."""
    if not profile:
        return 0
    fields_to_check = [
        profile.full_name,
        profile.phone,
        profile.college,
        profile.degree,
        profile.branch,
        profile.graduation_year,
        profile.current_year,
        profile.cgpa,
        profile.bio,
        profile.experience_level,
        profile.preferred_work_mode,
        profile.target_role,
        profile.target_domain,
    ]
    filled = sum(1 for val in fields_to_check if val is not None and str(val).strip() != "")
    return int(round((filled / len(fields_to_check)) * 100))

@router.get("", response_model=CareerProfileResponse)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch authenticated user's career profile."""
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career profile not found for this user."
        )
    profile_response = CareerProfileResponse.model_validate(profile)
    profile_response.completion_percentage = calculate_completion_percentage(profile)
    return profile_response

@router.post("", response_model=CareerProfileResponse, status_code=status.HTTP_201_CREATED)
def create_user_profile(
    profile_in: CareerProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a career profile for the authenticated user."""
    existing = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Career profile already exists for this user."
        )

    data = profile_in.model_dump(exclude_unset=True)
    if not data.get("full_name"):
        data["full_name"] = current_user.full_name

    profile = CareerProfile(user_id=current_user.id, **data)
    db.add(profile)
    db.commit()
    db.refresh(profile)

    profile_response = CareerProfileResponse.model_validate(profile)
    profile_response.completion_percentage = calculate_completion_percentage(profile)
    return profile_response

@router.put("", response_model=CareerProfileResponse)
@router.patch("", response_model=CareerProfileResponse)
def update_user_profile(
    profile_in: CareerProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update existing career profile for authenticated user."""
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if not profile:
        # If no profile exists yet, create one on update to be developer-friendly
        data = profile_in.model_dump(exclude_unset=True)
        if not data.get("full_name"):
            data["full_name"] = current_user.full_name
        profile = CareerProfile(user_id=current_user.id, **data)
        db.add(profile)
    else:
        update_data = profile_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    profile_response = CareerProfileResponse.model_validate(profile)
    profile_response.completion_percentage = calculate_completion_percentage(profile)
    return profile_response

@router.delete("", status_code=status.HTTP_200_OK)
def delete_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete authenticated user's career profile."""
    profile = db.query(CareerProfile).filter(CareerProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Career profile not found."
        )
    db.delete(profile)
    db.commit()
    return {"detail": "Career profile successfully deleted."}
