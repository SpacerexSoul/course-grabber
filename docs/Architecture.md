# Architecture

## Overview

Course-Grabber uses a three-component architecture:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Chrome Ext.    │────▶│  Desktop App    │────▶│  FastAPI        │
│  (URL Capture)  │     │  (React/Electron)│    │  (yt-dlp)       │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Components

### 1. Backend (FastAPI + yt-dlp)
**Location:** `packages/backend/`

- RESTful API for managing projects and downloads
- Wraps yt-dlp for video downloading
- Handles project/lesson data storage
- Runs as a local service on `localhost:8000`

**Key Files:**
- `main.py` - FastAPI application entry point
- `routers/` - API route handlers
- `models/` - Pydantic data models
- `services/` - Business logic (yt-dlp wrapper)

### 2. Desktop App (Electron + React + TypeScript)
**Location:** `packages/desktop/`

- Cross-platform desktop application
- Modern React UI with TypeScript
- Styled with Tailwind CSS
- Communicates with backend via HTTP

**Key Files:**
- `src/main/` - Electron main process
- `src/renderer/` - React application
- `src/components/` - UI components

### 3. Chrome Extension (Manifest V3)
**Location:** `packages/extension/`

- Detects video players on web pages
- Extracts embedded video URLs
- Sends URLs to desktop app

**Key Files:**
- `manifest.json` - Extension configuration
- `content.ts` - Page content scripts
- `background.ts` - Service worker

## Data Flow

```
1. User navigates to course page
2. Chrome extension detects video URLs
3. User clicks "Send to Course-Grabber"
4. Extension sends URL to Desktop App
5. Desktop App displays URL in project
6. User clicks Download
7. Desktop App calls Backend API
8. Backend uses yt-dlp to download
9. Video saved to specified location
```

## Data Storage

### MVP (JSON)
```
~/.course-grabber/
├── config.json          # App settings
└── projects/
    ├── project-1.json   # Project data
    └── project-2.json
```

### Future (SQLite)
```
~/.course-grabber/
├── config.json
└── database.sqlite      # All data
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List all projects |
| POST | `/projects` | Create new project |
| GET | `/projects/{id}` | Get project details |
| PUT | `/projects/{id}` | Update project |
| DELETE | `/projects/{id}` | Delete project |
| POST | `/projects/{id}/lessons` | Add lesson |
| POST | `/download` | Start download |
| GET | `/download/{id}/status` | Download progress |
