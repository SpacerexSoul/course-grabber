# Installation Guide

## Prerequisites

Before installing Course-Grabber, make sure you have the following installed:

### Required
- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **yt-dlp** - Video downloader

### Installing yt-dlp

**macOS (Homebrew):**
```bash
brew install yt-dlp
```

**Windows (winget):**
```bash
winget install yt-dlp
```

**pip (any platform):**
```bash
pip install yt-dlp
```

## Installation

### Option 1: Download Release (Recommended)

1. Go to the [Releases page](https://github.com/SpacerexSoul/course-grabber/releases)
2. Download the latest version for your platform
3. Run the installer

### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/SpacerexSoul/course-grabber.git
cd course-grabber

# Install backend dependencies
cd packages/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Install desktop app dependencies
cd ../desktop
npm install

# Build the application
npm run build
```

## Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `packages/extension/dist` folder

## Verify Installation

```bash
# Check yt-dlp
yt-dlp --version

# Check Python
python --version

# Check Node.js
node --version
```

## Next Steps

- [Quick Start Guide](Quick-Start.md)
- [User Guide](User-Guide.md)
