"""
Downloads API router.
"""

import asyncio
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, BackgroundTasks

from models import DownloadRequest, DownloadProgress, DownloadStatus
from services.project_service import project_service
from services.download_service import download_service

router = APIRouter()

# Store for tracking active downloads
active_downloads: dict[UUID, list[DownloadProgress]] = {}


@router.post("", status_code=202)
async def start_download(data: DownloadRequest, background_tasks: BackgroundTasks):
    """Start downloading videos for a project."""
    project = project_service.get_project(data.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Initialize progress tracking
    download_id = data.project_id
    active_downloads[download_id] = []
    
    def progress_callback(progress: DownloadProgress):
        # Update progress in our store
        for i, p in enumerate(active_downloads.get(download_id, [])):
            if p.url_id == progress.url_id:
                active_downloads[download_id][i] = progress
                return
        active_downloads[download_id].append(progress)
    
    # Start download in background
    async def run_download():
        await download_service.download_project(
            project=project,
            lesson_ids=data.lesson_ids,
            progress_callback=progress_callback
        )
    
    background_tasks.add_task(asyncio.create_task, run_download())
    
    return {
        "message": "Download started",
        "download_id": str(download_id),
        "project_name": project.name
    }


@router.get("/{download_id}/status")
async def get_download_status(download_id: UUID):
    """Get the status of a download."""
    if download_id not in active_downloads:
        raise HTTPException(status_code=404, detail="Download not found")
    
    progress_list = active_downloads[download_id]
    
    # Calculate overall status
    total = len(progress_list)
    completed = sum(1 for p in progress_list if p.status == DownloadStatus.COMPLETED)
    failed = sum(1 for p in progress_list if p.status == DownloadStatus.FAILED)
    downloading = sum(1 for p in progress_list if p.status == DownloadStatus.DOWNLOADING)
    
    if total == 0:
        overall_status = "pending"
    elif downloading > 0:
        overall_status = "downloading"
    elif completed == total:
        overall_status = "completed"
    elif failed == total:
        overall_status = "failed"
    else:
        overall_status = "partial"
    
    return {
        "download_id": str(download_id),
        "status": overall_status,
        "total": total,
        "completed": completed,
        "failed": failed,
        "downloading": downloading,
        "progress": [p.model_dump() for p in progress_list]
    }


@router.delete("/{download_id}")
async def cancel_download(download_id: UUID):
    """Cancel a download (cleanup tracking)."""
    if download_id in active_downloads:
        del active_downloads[download_id]
    return {"message": "Download cancelled"}
