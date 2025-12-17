"""
Project management service.
Handles CRUD operations for projects stored as JSON files.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Optional
from uuid import UUID

from config import settings
from models import Project, ProjectCreate, ProjectUpdate, Lesson, LessonCreate, LessonUpdate, LessonURL, URLAdd


class ProjectService:
    """Service for managing projects."""
    
    def __init__(self):
        self.projects_dir = settings.projects_dir
    
    def _get_project_path(self, project_id: UUID) -> Path:
        """Get the file path for a project."""
        return self.projects_dir / f"{project_id}.json"
    
    def _save_project(self, project: Project) -> None:
        """Save a project to disk."""
        path = self._get_project_path(project.id)
        with open(path, "w") as f:
            json.dump(project.model_dump(mode="json"), f, indent=2, default=str)
    
    def _load_project(self, project_id: UUID) -> Optional[Project]:
        """Load a project from disk."""
        path = self._get_project_path(project_id)
        if not path.exists():
            return None
        with open(path) as f:
            data = json.load(f)
        return Project.model_validate(data)
    
    def list_projects(self) -> list[Project]:
        """List all projects."""
        projects = []
        for path in self.projects_dir.glob("*.json"):
            try:
                with open(path) as f:
                    data = json.load(f)
                projects.append(Project.model_validate(data))
            except Exception:
                continue
        return sorted(projects, key=lambda p: p.created_at, reverse=True)
    
    def get_project(self, project_id: UUID) -> Optional[Project]:
        """Get a project by ID."""
        return self._load_project(project_id)
    
    def create_project(self, data: ProjectCreate) -> Project:
        """Create a new project."""
        project = Project(
            name=data.name,
            description=data.description,
            save_location=data.save_location
        )
        # Ensure save location exists
        Path(data.save_location).mkdir(parents=True, exist_ok=True)
        self._save_project(project)
        return project
    
    def update_project(self, project_id: UUID, data: ProjectUpdate) -> Optional[Project]:
        """Update a project."""
        project = self._load_project(project_id)
        if not project:
            return None
        
        if data.name is not None:
            project.name = data.name
        if data.description is not None:
            project.description = data.description
        if data.save_location is not None:
            project.save_location = data.save_location
            Path(data.save_location).mkdir(parents=True, exist_ok=True)
        
        project.updated_at = datetime.now()
        self._save_project(project)
        return project
    
    def delete_project(self, project_id: UUID) -> bool:
        """Delete a project."""
        path = self._get_project_path(project_id)
        if not path.exists():
            return False
        path.unlink()
        return True
    
    def add_lesson(self, project_id: UUID, data: LessonCreate) -> Optional[Lesson]:
        """Add a lesson to a project."""
        project = self._load_project(project_id)
        if not project:
            return None
        
        order = data.order if data.order is not None else len(project.lessons) + 1
        lesson = Lesson(title=data.title, order=order)
        project.lessons.append(lesson)
        project.updated_at = datetime.now()
        self._save_project(project)
        return lesson
    
    def update_lesson(self, project_id: UUID, lesson_id: UUID, data: LessonUpdate) -> Optional[Lesson]:
        """Update a lesson."""
        project = self._load_project(project_id)
        if not project:
            return None
        
        for lesson in project.lessons:
            if lesson.id == lesson_id:
                if data.title is not None:
                    lesson.title = data.title
                if data.order is not None:
                    lesson.order = data.order
                lesson.updated_at = datetime.now()
                project.updated_at = datetime.now()
                self._save_project(project)
                return lesson
        return None
    
    def delete_lesson(self, project_id: UUID, lesson_id: UUID) -> bool:
        """Delete a lesson from a project."""
        project = self._load_project(project_id)
        if not project:
            return False
        
        original_len = len(project.lessons)
        project.lessons = [l for l in project.lessons if l.id != lesson_id]
        
        if len(project.lessons) < original_len:
            project.updated_at = datetime.now()
            self._save_project(project)
            return True
        return False
    
    def add_url(self, project_id: UUID, lesson_id: UUID, data: URLAdd) -> Optional[LessonURL]:
        """Add a URL to a lesson."""
        project = self._load_project(project_id)
        if not project:
            return None
        
        for lesson in project.lessons:
            if lesson.id == lesson_id:
                part_number = data.part_number if data.part_number else len(lesson.urls) + 1
                url = LessonURL(url=data.url, part_number=part_number)
                lesson.urls.append(url)
                lesson.updated_at = datetime.now()
                project.updated_at = datetime.now()
                self._save_project(project)
                return url
        return None
    
    def delete_url(self, project_id: UUID, lesson_id: UUID, url_id: UUID) -> bool:
        """Delete a URL from a lesson."""
        project = self._load_project(project_id)
        if not project:
            return False
        
        for lesson in project.lessons:
            if lesson.id == lesson_id:
                original_len = len(lesson.urls)
                lesson.urls = [u for u in lesson.urls if u.id != url_id]
                if len(lesson.urls) < original_len:
                    lesson.updated_at = datetime.now()
                    project.updated_at = datetime.now()
                    self._save_project(project)
                    return True
        return False


# Singleton instance
project_service = ProjectService()
