from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    """
    Application Settings configuration.
    Reads environment variables from backend/.env file or system environment.
    """
    PROJECT_NAME: str = "SkillForge AI"
    ENV: str = "development"
    SECRET_KEY: str = "default_secret_key_change_in_production_at_least_32_bytes_long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = "sqlite:///./skillforge.db"
    ALLOWED_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    GEMINI_API_KEY: Union[str, None] = None
    AI_MODEL: str = "gemini-2.5-flash"
    UPLOAD_DIR: str = "./uploads/resumes"
    MAX_UPLOAD_SIZE_MB: int = 5

    @field_validator("ALLOWED_CORS_ORIGINS", mode="before")
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except Exception:
                return [origin.strip() for origin in v.split(",")]
        return v

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True)

settings = Settings()
