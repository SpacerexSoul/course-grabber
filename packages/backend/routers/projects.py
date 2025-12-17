"""
Projects API router.
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException

from models import (
    Project, ProjectCreate, ProjectUpdate,
    Lesson, LessonCreate, LessonUpdate,
    LessonURL, URLAdd
)
from services.project_service import project_service

router = APIRouter()


@router.get("", response_model=list[Project])
async def list_projects():
    """List all projects."""
    return project_service.list_projects()


@router.post("", response_model=Project, status_code=201)
async def create_project(data: ProjectCreate):
    """Create a new project."""
    return project_service.create_project(data)


@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: UUID):
    """Get a project by ID."""
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=Project)
async def update_project(project_id: UUID, data: ProjectUpdate):
    """Update a project."""
    project = project_service.update_project(project_id, data)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: UUID):
    """Delete a project."""
    if not project_service.delete_project(project_id):
        raise HTTPException(status_code=404, detail="Project not found")


# Lesson endpoints

@router.post("/{project_id}/lessons", response_model=Lesson, status_code=201)
async def add_lesson(project_id: UUID, data: LessonCreate):
    """Add a lesson to a project."""
    lesson = project_service.add_lesson(project_id, data)
    if not lesson:
        raise HTTPException(status_code=404, detail="Project not found")
    return lesson


@router.put("/{project_id}/lessons/{lesson_id}", response_model=Lesson)
async def update_lesson(project_id: UUID, lesson_id: UUID, data: LessonUpdate):
    """Update a lesson."""
    lesson = project_service.update_lesson(project_id, lesson_id, data)
    if not lesson:
        raise HTTPException(status_code=404, detail="Project or lesson not found")
    return lesson


@router.delete("/{project_id}/lessons/{lesson_id}", status_code=204)
async def delete_lesson(project_id: UUID, lesson_id: UUID):
    """Delete a lesson."""
    if not project_service.delete_lesson(project_id, lesson_id):
        raise HTTPException(status_code=404, detail="Project or lesson not found")


# URL endpoints

@router.post("/{project_id}/lessons/{lesson_id}/urls", response_model=LessonURL, status_code=201)
async def add_url(project_id: UUID, lesson_id: UUID, data: URLAdd):
    """Add a URL to a lesson."""
    url = project_service.add_url(project_id, lesson_id, data)
    if not url:
        raise HTTPException(status_code=404, detail="Project or lesson not found")
    return url


@router.delete("/{project_id}/lessons/{lesson_id}/urls/{url_id}", status_code=204)
async def delete_url(project_id: UUID, lesson_id: UUID, url_id: UUID):
    """Delete a URL from a lesson."""
    if not project_service.delete_url(project_id, lesson_id, url_id):
        raise HTTPException(status_code=404, detail="Resource not found")
