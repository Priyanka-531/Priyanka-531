from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin
from app.core.security import hash_password, verify_password

def register_user(db: Session, user_in: UserRegister) -> User:
    """
    Registers a new user in the database.
    Checks for duplicate email addresses (case-insensitive) and hashes password before saving.
    """
    clean_email = user_in.email.strip().lower()
    clean_name = user_in.full_name.strip()

    # 1. Check if email already registered (case-insensitive)
    existing_user = db.query(User).filter(
        func.lower(User.email) == clean_email
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # 2. Hash plain-text password using bcrypt
    hashed_pwd = hash_password(user_in.password)

    # 3. Instantiate SQLAlchemy User ORM model
    db_user = User(
        full_name=clean_name,
        email=clean_email,
        hashed_password=hashed_pwd,
        is_active=True
    )

    # 4. Save to Database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, credentials: UserLogin) -> User:
    """
    Authenticates user against stored email and password hash.
    Performs case-insensitive email matching.
    Returns user instance or raises HTTP 401 Unauthorized exception.
    """
    clean_email = credentials.email.strip().lower()
    user = db.query(User).filter(
        func.lower(User.email) == clean_email
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive. Please contact support.",
        )

    return user
