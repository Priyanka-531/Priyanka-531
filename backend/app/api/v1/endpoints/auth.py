from fastapi import APIRouter, Depends, status, Request, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.user import UserRegister, UserResponse, Token, UserLogin
from app.services.auth_service import register_user, authenticate_user
from app.core.security import create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    user_in: UserRegister,
    db: Session = Depends(get_db)
):
    """
    Register a new user account.

    Expects:
    - full_name
    - email
    - password
    """
    return register_user(
        db=db,
        user_in=user_in
    )


@router.post(
    "/login",
    response_model=Token,
    summary="User Login (JWT / JWS)",
    openapi_extra={
        "requestBody": {
            "content": {
                "application/json": {
                    "schema": UserLogin.model_json_schema()
                }
            }
        }
    }
)
async def login(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and generate signed JWT (JWS) access token.

    Accepts:
    - JSON payload: {"email": "...", "password": "..."}
    - Form-urlencoded: username=...&password=...

    Returns:
    - access_token: Signed JWT token (JWS HS256)
    - token_type: "bearer"
    """
    content_type = request.headers.get("content-type", "")
    email = None
    password = None

    if "application/json" in content_type:
        try:
            body = await request.json()
            if isinstance(body, dict):
                email = body.get("email") or body.get("username")
                password = body.get("password")
        except Exception:
            pass
    elif "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
        try:
            form = await request.form()
            email = form.get("username") or form.get("email")
            password = form.get("password")
        except Exception:
            pass
    else:
        # Try JSON first, then Form
        try:
            body = await request.json()
            if isinstance(body, dict):
                email = body.get("email") or body.get("username")
                password = body.get("password")
        except Exception:
            try:
                form = await request.form()
                email = form.get("username") or form.get("email")
                password = form.get("password")
            except Exception:
                pass

    email_str = str(email).strip().lower() if email else ""
    password_str = str(password) if password is not None else ""

    if not email_str or not password_str:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email and password are required."
        )

    credentials = UserLogin(
        email=email_str,
        password=password_str
    )

    user = authenticate_user(
        db=db,
        credentials=credentials
    )

    access_token = create_access_token(
        subject=user.email
    )

    return Token(
        access_token=access_token,
        token_type="bearer"
    )


@router.post(
    "/token",
    response_model=Token,
    summary="OAuth2 Password Flow Token Endpoint"
)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 standard token endpoint accepting form-data credentials.
    """
    credentials = UserLogin(
        email=form_data.username,
        password=form_data.password
    )

    user = authenticate_user(
        db=db,
        credentials=credentials
    )

    access_token = create_access_token(
        subject=user.email
    )

    return Token(
        access_token=access_token,
        token_type="bearer"
    )


@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    """
    Protected endpoint.

    Returns the currently authenticated user.
    Requires a valid Bearer JWT token.
    """
    return current_user


@router.delete(
    "/account",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete User Account"
)
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Safely delete user account and cascade delete all personal records.
    """
    db.delete(current_user)
    db.commit()
    return None