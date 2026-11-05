from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Configure SQLite connect_args if using SQLite (for local dev fallback)
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# 1. SQLAlchemy Engine: Manages the connection pool to PostgreSQL / Database
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False # Set to True if you want to see raw SQL logs in terminal
)

# 2. SessionLocal: Factory that produces database sessions for each HTTP request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. Base: Parent class for all ORM database models
Base = declarative_base()

# 4. get_db Dependency: Yields DB session to route handlers and closes it automatically
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
