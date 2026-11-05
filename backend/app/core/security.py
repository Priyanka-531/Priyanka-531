from datetime import datetime, timedelta, timezone
from typing import Optional, Any
import jwt
import bcrypt
from app.core.config import settings

def hash_password(password: str) -> str:
    """
    Hashes a plain-text password using bcrypt salted hashing algorithm.
    One-way operation: Passwords cannot be decrypted back into plain text.
    """
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies if a plain-text password matches a stored bcrypt hash.
    Computes hash of plain_password with stored salt and compares in constant time.
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

def create_access_token(subject: Any, expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a signed JWT Access Token containing user identity (sub) and expiration time (exp).
    Signed with server's SECRET_KEY using HMAC-SHA256 (HS256).
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "iat": datetime.now(timezone.utc)
    }
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """
    Decodes and validates a JWT Access Token.
    Returns payload dictionary if valid, or None if expired/invalid signature.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
