# Contributing to Course-Grabber

First off, thank you for considering contributing to Course-Grabber! 🎉

## 🚀 Quick Start for Contributors

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/course-grabber.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit: `git commit -m "Add your feature"`
7. Push: `git push origin feature/your-feature-name`
8. Open a Pull Request

## 📁 Project Structure

```
packages/
├── backend/     # Python FastAPI service
├── desktop/     # Electron + React app
└── extension/   # Chrome extension
```

## 🛠️ Development Setup

### Backend (Python)
```bash
cd packages/backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### Desktop (Node.js)
```bash
cd packages/desktop
npm install
npm run dev
```

### Extension
```bash
cd packages/extension
npm install
npm run build
# Load unpacked extension in Chrome from dist/
```

## 📝 Code Style

### Python
- Use [Black](https://black.readthedocs.io/) for formatting
- Use [Ruff](https://github.com/astral-sh/ruff) for linting
- Type hints are required

### TypeScript
- Use ESLint + Prettier
- Strict mode enabled
- Prefer functional components in React

## 🧪 Testing

```bash
# Backend
cd packages/backend
pytest

# Desktop
cd packages/desktop
npm test

# Extension
cd packages/extension
npm test
```

## 📋 Pull Request Process

1. Update README.md if needed
2. Update documentation in the Wiki
3. Add tests for new features
4. Ensure all tests pass
5. Request review from maintainers

## 🐛 Reporting Bugs

Use the GitHub Issues template to report bugs. Include:
- OS and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 💡 Feature Requests

Open an issue with the "enhancement" label. Describe:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

## 📜 Code of Conduct

Be respectful and constructive. We're all here to learn and build something useful together.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
