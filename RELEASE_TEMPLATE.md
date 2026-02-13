# Release Checklist — ChildSafeNet

> Dùng file này mỗi lần bạn tạo release (vX.Y.Z) cho repo.

## 1) Pre-release
- [ ] Bump version:
  - [ ] `src/ai-service/app.py` (API version string, nếu có)
  - [ ] `src/Childsafenet.Api/Childsafenet.Api.csproj` (AssemblyVersion/Version nếu dùng)
  - [ ] `src/Childsafenet.frontend/package.json` (version)
  - [ ] `src/chrome-extension/manifest.json` (version)
- [ ] Chạy lint/test:
  - [ ] Frontend: `npm ci && npm run lint && npm run build`
  - [ ] API: `dotnet test` (nếu có) + `dotnet build`
  - [ ] AI: `python -m pytest` (nếu có) + smoke test `/health`
- [ ] Update changelog (nếu dùng `CHANGELOG.md`)

## 2) Model & Dataset
- [ ] Dataset snapshot được export (Approved only) và commit vào `data/snapshots/` (khuyến nghị)
- [ ] Model artifact mới được lưu vào `artifacts/models/<model_version>/`
- [ ] `model_manifest.json` được update (checksum, metrics, trained_at)

## 3) Security
- [ ] Secrets không nằm trong repo (JWT key, connection string, API keys)
- [ ] CORS production không để `*`
- [ ] Security headers middleware bật ở API

## 4) Deploy
- [ ] Docker build OK:
  - [ ] `docker compose build`
  - [ ] `docker compose up -d`
- [ ] Smoke test:
  - [ ] `GET /health` (AI + API)
  - [ ] Login + Scan + Dashboard
  - [ ] Extension Pair + Toggle + Block page

## 5) Release Notes (copy paste)
### Highlights
- 

### Fixed
- 

### Known issues
- 

### Upgrade notes
- 
