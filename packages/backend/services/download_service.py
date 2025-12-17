"""
Download service using yt-dlp.
"""

import asyncio
from pathlib import Path
from typing import Callable, Optional
from uuid import UUID

import yt_dlp

from config import settings
from models import DownloadProgress, DownloadStatus, LessonURL, Project


class DownloadService:
    """Service for downloading videos using yt-dlp."""
    
    def __init__(self):
        self.active_downloads: dict[UUID, asyncio.Task] = {}
        self.progress_callbacks: dict[UUID, Callable[[DownloadProgress], None]] = {}
    
    def _create_yt_dlp_opts(
        self,
        output_path: str,
        progress_hook: Optional[Callable] = None
    ) -> dict:
        """Create yt-dlp options."""
        opts = {
            "format": settings.default_format,
            "outtmpl": output_path,
            "quiet": True,
            "no_warnings": True,
            "extract_flat": False,
        }
        if progress_hook:
            opts["progress_hooks"] = [progress_hook]
        return opts
    
    async def download_url(
        self,
        url: str,
        output_path: str,
        url_id: UUID,
        lesson_id: UUID,
        progress_callback: Optional[Callable[[DownloadProgress], None]] = None
    ) -> DownloadProgress:
        """Download a single URL."""
        
        progress = DownloadProgress(
            lesson_id=lesson_id,
            url_id=url_id,
            status=DownloadStatus.DOWNLOADING,
            progress=0.0
        )
        
        def progress_hook(d):
            nonlocal progress
            if d["status"] == "downloading":
                # Parse progress
                total = d.get("total_bytes") or d.get("total_bytes_estimate", 0)
                downloaded = d.get("downloaded_bytes", 0)
                if total > 0:
                    progress.progress = (downloaded / total) * 100
                progress.speed = d.get("_speed_str", "")
                progress.eta = d.get("_eta_str", "")
                progress.filename = d.get("filename", "")
                if progress_callback:
                    progress_callback(progress)
            elif d["status"] == "finished":
                progress.status = DownloadStatus.COMPLETED
                progress.progress = 100.0
                progress.filename = d.get("filename", "")
                if progress_callback:
                    progress_callback(progress)
        
        try:
            opts = self._create_yt_dlp_opts(output_path, progress_hook)
            
            # Run yt-dlp in a thread pool to not block
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: yt_dlp.YoutubeDL(opts).download([url])
            )
            
            progress.status = DownloadStatus.COMPLETED
            progress.progress = 100.0
            
        except Exception as e:
            progress.status = DownloadStatus.FAILED
            progress.error = str(e)
            if progress_callback:
                progress_callback(progress)
        
        return progress
    
    async def download_lesson(
        self,
        project: Project,
        lesson_id: UUID,
        progress_callback: Optional[Callable[[DownloadProgress], None]] = None
    ) -> list[DownloadProgress]:
        """Download all URLs for a lesson."""
        results = []
        
        lesson = next((l for l in project.lessons if l.id == lesson_id), None)
        if not lesson:
            return results
        
        for url_obj in lesson.urls:
            # Build output filename
            if len(lesson.urls) > 1:
                filename = f"{lesson.title} part {url_obj.part_number}.%(ext)s"
            else:
                filename = f"{lesson.title}.%(ext)s"
            
            output_path = str(Path(project.save_location) / filename)
            
            result = await self.download_url(
                url=url_obj.url,
                output_path=output_path,
                url_id=url_obj.id,
                lesson_id=lesson_id,
                progress_callback=progress_callback
            )
            results.append(result)
        
        return results
    
    async def download_project(
        self,
        project: Project,
        lesson_ids: Optional[list[UUID]] = None,
        progress_callback: Optional[Callable[[DownloadProgress], None]] = None
    ) -> list[DownloadProgress]:
        """Download all or selected lessons from a project."""
        results = []
        
        lessons_to_download = project.lessons
        if lesson_ids:
            lessons_to_download = [l for l in project.lessons if l.id in lesson_ids]
        
        for lesson in lessons_to_download:
            lesson_results = await self.download_lesson(
                project=project,
                lesson_id=lesson.id,
                progress_callback=progress_callback
            )
            results.extend(lesson_results)
        
        return results


# Singleton instance
download_service = DownloadService()
