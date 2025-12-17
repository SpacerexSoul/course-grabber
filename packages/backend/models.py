"""
Pydantic models for Course-Grabber.
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class DownloadStatus(str, Enum):
    """Status of a download."""
    PENDING = "pending"
    DOWNLOADING = "downloading"
    COMPLETED = "completed"
    FAILED = "failed"
    PAUSED = "paused"


class LessonURL(BaseModel):
    """A single URL within a lesson."""
    id: UUID = Field(default_factory=uuid4)
    url: str
    part_number: int = 1
    status: DownloadStatus = DownloadStatus.PENDING
    filename: Optional[str] = None
    error: Optional[str] = None


class Lesson(BaseModel):
    """A lesson within a project."""
    id: UUID = Field(default_factory=uuid4)
    title: str
    order: int
    urls: list[LessonURL] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class Project(BaseModel):
    """A download project containing lessons."""
    id: UUID = Field(default_factory=uuid4)
    name: str
    description: Optional[str] = None
    save_location: str
    lessons: list[Lesson] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


# Request/Response models

class ProjectCreate(BaseModel):
    """Request model for creating a project."""
    name: str
    description: Optional[str] = None
    save_location: str


class ProjectUpdate(BaseModel):
    """Request model for updating a project."""
    name: Optional[str] = None
    description: Optional[str] = None
    save_location: Optional[str] = None


class LessonCreate(BaseModel):
    """Request model for creating a lesson."""
    title: str
    order: Optional[int] = None


class LessonUpdate(BaseModel):
    """Request model for updating a lesson."""
    title: Optional[str] = None
    order: Optional[int] = None


class URLAdd(BaseModel):
    """Request model for adding a URL to a lesson."""
    url: str
    part_number: Optional[int] = None


class DownloadRequest(BaseModel):
    """Request model for starting a download."""
    project_id: UUID
    lesson_ids: Optional[list[UUID]] = None  # None = all lessons


class DownloadProgress(BaseModel):
    """Progress information for a download."""
    lesson_id: UUID
    url_id: UUID
    status: DownloadStatus
    progress: float = 0.0  # 0-100
    speed: Optional[str] = None
    eta: Optional[str] = None
    filename: Optional[str] = None
    error: Optional[str] = None
