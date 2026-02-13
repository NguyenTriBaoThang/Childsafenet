# Contributing to ChildSafeNet

Thank you for your interest in contributing to ChildSafeNet! 🎉  
We welcome contributions from developers, researchers, security enthusiasts, and parents who want to improve online safety for children.

## Project structure
```
childsafenet/
├── src/
│   ├── ai-service/               # FastAPI (Python) - model inference
│   ├── Childsafenet.Api/         # ASP.NET Core 8 API (C#) + SQL Server
│   ├── Childsafenet.frontend/    # React + TypeScript web app
│   └── chrome-extension/         # Chrome/Edge extension (MV3)
└── .github/
```

## How to contribute
1. Fork the repo and create a branch:
   - `feat/<short-name>` for new features
   - `fix/<short-name>` for bug fixes
2. Make changes with small commits.
3. Add/update tests where relevant.
4. Run checks locally (see below).
5. Open a Pull Request with a clear description and screenshots if UI changes.

You can contribute in many ways:

- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📚 Improving documentation
- 🔐 Improving AI models & security logic
- 🧪 Writing tests
- 🧹 Refactoring code

## Development setup (local)

### Backend: ASP.NET Core 8
- Requirements: .NET SDK 8, SQL Server
- Configure `appsettings.json` connection string
- Run:
  - `dotnet restore`
  - `dotnet ef database update` (if migrations exist)
  - `dotnet run`

### AI service: FastAPI
- Requirements: Python 3.10+ (recommended 3.10/3.11)
- In `src/ai-service/`:
  - `pip install -r requirements.txt`
  - `uvicorn app:app --reload --port 8000`

### Frontend: React + TS
- In `src/Childsafenet.frontend/`:
  - `npm install`
  - `npm run dev`

### Extension: Chrome/Edge (MV3)
- Load unpacked from `src/chrome-extension/` in `chrome://extensions` (Developer mode).

## Coding style
- Keep functions small and readable.
- Prefer explicit names over abbreviations.

## Commit message guideline
Use:
- `feat: ...`
- `fix: ...`
- `docs: ...`
- `refactor: ...`
- `chore: ...`

## Reporting issues
Use the issue templates:
- Bug report
- Feature request
- AI/Model issue (advanced form)

## Security
See `SECURITY.md`.

By contributing, you agree that your contributions will be licensed under the repository license.
