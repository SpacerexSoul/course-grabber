# 🎓 Course-Grabber

> A modern, easy-to-use tool for downloading course videos with custom organization.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 🖥️ **Desktop GUI** - Beautiful, intuitive interface built with Electron + React
- 🌐 **Chrome Extension** - Extract embedded video URLs from course platforms
- 📁 **Project Management** - Organize downloads by course/project
- 📝 **Custom Lesson Titles** - Name your videos exactly how you want
- ⬇️ **Powered by yt-dlp** - Download from virtually any video platform
- 🔄 **Multi-video Support** - Multiple videos per lesson (parts)

## 📦 Architecture

```
course-grabber/
├── packages/
│   ├── backend/      # FastAPI + yt-dlp service
│   ├── desktop/      # Electron + React + TypeScript GUI
│   └── extension/    # Chrome Extension (Manifest V3)
├── docs/             # Documentation
└── .github/          # GitHub workflows & templates
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- yt-dlp (`pip install yt-dlp` or `brew install yt-dlp`)

### Installation

```bash
# Clone the repository
git clone https://github.com/SpacerexSoul/course-grabber.git
cd course-grabber

# Install backend dependencies
cd packages/backend
pip install -r requirements.txt

# Install desktop app dependencies
cd ../desktop
npm install

# Start the application
npm run dev
```

## 🖥️ Desktop App

The desktop application provides:
- Create and manage download projects
- Set custom save locations
- Define lessons with custom titles
- Add multiple video URLs per lesson
- Track download progress

## 🌐 Chrome Extension

The browser extension helps you:
- Detect embedded video players on course pages
- Extract video URLs automatically
- Send URLs directly to the desktop app

## 🛠️ Development

See the [Wiki](../../wiki) for detailed development documentation.

### Running Locally

```bash
# Terminal 1: Start backend
cd packages/backend
uvicorn main:app --reload

# Terminal 2: Start desktop app
cd packages/desktop
npm run dev
```

## 📚 Documentation

- [Wiki Home](../../wiki)
- [Installation Guide](../../wiki/Installation)
- [User Guide](../../wiki/User-Guide)
- [Development Setup](../../wiki/Development)
- [API Reference](../../wiki/API-Reference)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is intended for downloading videos you have legitimate access to. Please respect content creators and platform terms of service. The developers are not responsible for misuse of this software.

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - The amazing video downloader this project is built upon
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Electron](https://www.electronjs.org/) - Cross-platform desktop apps
- [React](https://react.dev/) - UI library
