---
title: Getting Started
---

# 🚀 Getting Started

Run the full ChildSafeNet system locally: API + Web Dashboard + Database + Extension.

This guide walks you from clone → run → first scan → extension pairing.

---

# 🧰 Prerequisites

- .NET SDK 8
- Node.js 18+
- SQL Server Local (Express / Developer / LocalDB)
- Git
- (Optional) Docker Desktop

Verify installations:

```bash
dotnet --version
node --version
npm --version
```

---

# 📦 1) Clone Repository

```bash
git clone https://github.com/NguyenTriBaoThang/Childsafenet.git
cd Childsafenet
```

---

# 🗄 2) Backend (ASP.NET Core API)

Navigate to API project:

```bash
cd src/Childsafenet.Api
```

Restore packages:

```bash
dotnet restore
```

Apply migrations:

```bash
dotnet ef database update
```

Run API:

```bash
dotnet run
```

API should be available at (replace `xxxx` with your local port):

```text
https://localhost:xxxx
```

Swagger UI enabled at:

```text
https://localhost:xxxx/swagger
```

> Tip: Your actual port is printed in the terminal after `dotnet run` (look for “Now listening on …”).

---

# 🌐 3) Frontend (React + Vite)

Navigate to frontend project:

```bash
cd src/Childsafenet.Frontend
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open browser at:

```text
http://localhost:5173
```

---

# 👤 4) First Login

1. Open Register page
2. Create Parent account
3. Login
4. Token stored in localStorage (`csn_token`)
5. Open Dashboard

You should now see:

- Protection mode selector
- Scan logs table
- Pairing token section

---

# 🔍 5) Quick Scan Test (Web)

1. Open Scan page
2. Paste test URL
3. Click Scan
4. Verify result: `ALLOW` / `WARN` / `BLOCK`
5. Check Dashboard → Logs → confirm entry stored in database

---

# 🧩 6) Install Extension (Developer Mode)

1. Open `chrome://extensions` or `edge://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select folder:

```text
chrome-extension/
```

---

# 🔗 7) Pair Extension

1. Generate pairing token in Dashboard
2. Open extension popup
3. Paste token
4. Verify status: **PAIRED**

Now navigation should trigger real-time blocking.

---

# 🧪 8) End-to-End Test

1. Visit a known risky test URL
2. Extension calls `/api/scan`
3. If `BLOCK` → `block.html` loads
4. Check Dashboard → Logs → entry created

---

# 🐳 Optional: Docker Workflow

If using Docker:

```bash
docker-compose up --build
```

Ensure:

- API container running
- SQL container healthy
- Correct environment variables

---

# ⚠ Troubleshooting

## 401 Unauthorized

- Check JWT token exists in localStorage (`csn_token`)
- Ensure `Authorization` header is sent

## Database Connection Error

- Verify SQL Server running
- Check connection string in `appsettings.Development.json`

## CORS Error

- Ensure API allows frontend origin in development

## Extension NOT READY

- Reload extension
- Check Service Worker console

---

# ✅ Expected System State

After successful setup:

- API running
- Database migrated
- Frontend accessible
- Extension paired
- Scan logs stored
- Mode toggles working

---

# 📌 Next Steps

- System Architecture
- API Reference
- Browser Extension
- AI Training (Periodic)
- Security

---

ChildSafeNet is now fully operational in local development mode.