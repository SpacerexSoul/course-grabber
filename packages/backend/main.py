"""
Course-Grabber Backend
FastAPI application for managing course video downloads.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import projects, downloads
from config import settings

app = FastAPI(
    title="Course-Grabber API",
    description="Backend service for managing course video downloads",
    version="1.0.0"
)

# CORS middleware for desktop app communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}


# Include routers
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(downloads.router, prefix="/api/downloads", tags=["downloads"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.port)
