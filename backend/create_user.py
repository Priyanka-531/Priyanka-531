"""
SkillForge AI - CLI User Creation & JWT Token Generator

Run this script to create a user account by yourself directly in the database
and generate a signed JWT (JWS) access token for immediate API access.

Usage:
    # Interactive mode (prompts for inputs):
    python create_user.py

    # Non-interactive mode (command-line arguments):
    python create_user.py --name "Jane Doe" --email "jane@example.com" --password "secretpassword123"
"""

import sys
import argparse
import getpass
from datetime import datetime, timezone

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.core.security import hash_password, create_access_token


def main():
    parser = argparse.ArgumentParser(
        description="Create a user in the SkillForge AI database and generate a signed JWT (JWS) token."
    )
    parser.add_argument("--name", "-n", help="Full name of the user", default=None)
    parser.add_argument("--email", "-e", help="Email address of the user", default=None)
    parser.add_argument("--password", "-p", help="Plain text password", default=None)

    args = parser.parse_args()

    full_name = args.name
    email = args.email
    password = args.password

    # Interactive prompts if not provided
    print("=" * 60)
    print("  SkillForge AI - Create User & Generate JWS/JWT Token")
    print("=" * 60)

    if not full_name:
        try:
            full_name = input("Enter Full Name: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nAborted.")
            sys.exit(1)

    if not email:
        try:
            email = input("Enter Email Address: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nAborted.")
            sys.exit(1)

    if not password:
        try:
            password = getpass.getpass("Enter Password (min 6 chars): ").strip()
            confirm = getpass.getpass("Confirm Password: ").strip()
            if password != confirm:
                print("\n[ERROR] Passwords do not match!")
                sys.exit(1)
        except (KeyboardInterrupt, EOFError):
            print("\nAborted.")
            sys.exit(1)

    # Validation
    if not full_name or len(full_name) < 2:
        print("[ERROR] Full name must be at least 2 characters long.")
        sys.exit(1)

    if not email or "@" not in email or "." not in email:
        print("[ERROR] Please provide a valid email address.")
        sys.exit(1)

    if not password or len(password) < 6:
        print("[ERROR] Password must be at least 6 characters long.")
        sys.exit(1)

    # Ensure database tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    email = email.strip().lower()
    full_name = full_name.strip()

    try:
        from sqlalchemy import func
        # Check existing user
        existing = db.query(User).filter(func.lower(User.email) == email).first()
        if existing:
            print(f"\n[INFO] User with email '{email}' already exists! (ID: {existing.id})")
            print(f"Updating user password and regenerating active JWT (JWS) access token...")
            existing.hashed_password = hash_password(password)
            if full_name:
                existing.full_name = full_name
            existing.is_active = True
            existing.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(existing)
            access_token = create_access_token(subject=existing.email)
            print("-" * 60)
            print("  USER PASSWORD UPDATED SUCCESSFULLY")
            print("-" * 60)
            print(f"  User ID:    {existing.id}")
            print(f"  Full Name:  {existing.full_name}")
            print(f"  Email:      {existing.email}")
            print(f"  Active:     {existing.is_active}")
            print("-" * 60)
            print(f"  Access Token (Bearer JWT / JWS):")
            print(access_token)
            print("-" * 60)
            return

        # Hash password and create user
        hashed = hash_password(password)
        user = User(
            full_name=full_name,
            email=email,
            hashed_password=hashed,
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Generate JWS / JWT Access Token
        access_token = create_access_token(subject=user.email)

        print("\n" + "=" * 60)
        print("  USER CREATED SUCCESSFULLY")
        print("=" * 60)
        print(f"  User ID:    {user.id}")
        print(f"  Full Name:  {user.full_name}")
        print(f"  Email:      {user.email}")
        print(f"  Active:     {user.is_active}")
        print(f"  Created At: {user.created_at}")
        print("-" * 60)
        print("  SIGNED JWT (JWS) ACCESS TOKEN:")
        print(f"  {access_token}")
        print("-" * 60)
        print("  Example API Request with Bearer Token:")
        print(f'  curl -X GET "http://127.0.0.1:8000/api/v1/auth/me" \\')
        print(f'    -H "Authorization: Bearer {access_token}"')
        print("=" * 60)

    finally:
        db.close()


if __name__ == "__main__":
    main()
