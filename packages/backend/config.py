"""
Application configuration using pydantic-settings.
"""

from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # Server
    port: int = 8000
    debug: bool = True
    
    # Paths
    data_dir: Path = Path.home() / ".course-grabber"
    projects_dir: Path = data_dir / "projects"
    
    # Download settings
    default_format: str = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best"
    
    class Config:
        env_prefix = "COURSE_GRABBER_"


settings = Settings()

# Ensure directories exist
settings.data_dir.mkdir(parents=True, exist_ok=True)
settings.projects_dir.mkdir(parents=True, exist_ok=True)
