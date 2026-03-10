# ChildSafeNet API

The **ChildSafeNet API** is the backend service responsible for handling all core logic of the ChildSafeNet platform.

It provides endpoints for:

- URL scanning
- AI risk evaluation
- parental settings
- dataset administration
- communication with the browser extension

The API is built using **ASP.NET Core Web API** and integrates with the **AI Risk Engine** to detect harmful websites such as phishing, malware, adult content, and gambling platforms.

---

# Tech Stack

- **ASP.NET Core Web API**
- **Entity Framework Core**
- **SQL Server**
- **JWT Authentication**
- **RESTful API Architecture**
- **Docker**

---

# Core Responsibilities

The backend service performs several critical tasks.

### URL Risk Analysis

The API receives URL scan requests from:

- Web Dashboard
- Browser Extension

It forwards the URL to the **AI Risk Engine** and returns the classification result.

Possible classifications:

- `benign`
- `phishing`
- `malware`
- `adult`
- `gambling`

Based on system rules, the final decision can be:

- **ALLOW**
- **WARN**
- **BLOCK**

---

### Parental Control Logic

The backend applies policy rules configured by parents.

These include:

- Child age
- Protection mode (Strict / Balanced / Relaxed)
- Category blocking
- Allowlist / Blocklist overrides

The API combines **AI prediction + parent rules** to generate the final decision.

---

### Dataset Administration

The API also supports dataset review features used in the admin panel.

Administrators can:

- review URLs
- approve labels
- maintain training datasets
- manage flagged websites

This helps continuously improve the AI detection model.

---

# Project Structure

```
Childsafenet.Api/
│
├── Controllers/          # REST API endpoints
│
├── Data/                 # Database context (EF Core)
│
├── Dtos/                 # Request and response models
│
├── Migrations/           # Entity Framework migrations
│
├── Models/               # Database entities
│
├── Services/             # Business logic layer
│
├── Security/             # Authentication & security helpers
│
├── Properties/           # Project properties
│
├── appsettings.json
├── appsettings.Development.json
│
├── Program.cs            # Application entry point
├── Childsafenet.Api.csproj
├── Childsafenet.Api.http
│
├── Dockerfile            # Docker configuration
└── README.md
```

---

# Running the API Locally

### 1 Install dependencies

Restore packages:

```bash
dotnet restore
```

---

### 2 Run database migrations

```bash
dotnet ef database update
```

---

### 3 Start the API

```bash
dotnet run
```

Default development URL:

```
https://localhost:7047
```

---

# API Example

Example request for scanning a website.

### POST `/api/scan`

Request:

```json
{
  "url": "http://example.com"
}
```

Response:

```json
{
  "category": "phishing",
  "confidence": 0.92,
  "decision": "BLOCK"
}
```

---

# Authentication

Some endpoints require authentication using **JWT tokens**.

Typical flow:

1. User logs in via `/api/auth/login`
2. API returns JWT token
3. Token is sent in the `Authorization` header

Example:

```
Authorization: Bearer <token>
```

---

# Docker

You can run the API inside a Docker container.

Build image:

```bash
docker build -t childsafenet-api .
```

Run container:

```bash
docker run -p 5000:80 childsafenet-api
```

---

# Integration with ChildSafeNet Platform

The API communicates with several components:

```
Browser Extension
        ↓
ChildSafeNet API
        ↓
AI Risk Engine
        ↓
SQL Server Database
```

The system architecture allows **real-time protection for children while browsing the web**.

---

# Security

Security mechanisms include:

- JWT authentication
- input validation
- domain allow/block rules
- rate limiting (optional)

These protections help prevent abuse and ensure reliable API operation.

---

# Part of the ChildSafeNet Ecosystem

This API works together with:

- **ChildSafeNet Frontend** — parent dashboard
- **ChildSafeNet Chrome Extension** — real-time browser protection
- **ChildSafeNet AI Service** — machine learning risk detection
- **ChildSafeNet Documentation** — system documentation

---

Built to support **AI-powered child online safety systems**.
