---
title: API Reference
---

# 🧠 API Reference

RESTful API for authentication, parent settings, URL scanning, logging,
dataset review, and periodic model training.

---

# 🔐 Authentication

## POST `/api/auth/register`

Register a new user (Parent by default).

### Request Body

```json
{
  "email": "parent@example.com",
  "password": "StrongPassword123!",
  "fullName": "John Doe"
}
```

### Response

```json
{
  "id": 12,
  "email": "parent@example.com",
  "role": "Parent"
}
```

**Status Codes**
- 201 Created
- 400 Bad Request
- 409 Conflict

---

## POST `/api/auth/login`

Authenticate user and return JWT token.

### Request Body

```json
{
  "email": "parent@example.com",
  "password": "StrongPassword123!"
}
```

### Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "role": "Parent"
}
```

**Status Codes**
- 200 OK
- 401 Unauthorized

All protected endpoints require the HTTP header below:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

# 👨‍👩‍👧 Parent Endpoints

## GET `/api/settings`

Retrieve parent protection settings.

### Response

```json
{
  "mode": "Balanced",
  "whitelist": ["google.com"],
  "blacklist": ["example-bad.com"],
  "isProtectionEnabled": true
}
```

---

## PUT `/api/settings`

Update protection settings.

### Request Body

```json
{
  "mode": "Strict",
  "whitelist": ["school.edu"],
  "blacklist": [],
  "isProtectionEnabled": true
}
```

---

# 🔍 Scan Endpoint

## POST `/api/scan`

Used by Web Dashboard or Extension to evaluate a URL.

### Request Body

```json
{
  "url": "http://suspicious-site.com",
  "source": "Extension"
}
```

### Response

```json
{
  "label": "Phishing",
  "score": 0.92,
  "decision": "Block",
  "explanation": {
    "topFeatures": ["contains-ip", "long-url", "suspicious-tld"]
  }
}
```

---

# 📜 Logs

## GET `/api/logs?page=1&pageSize=10`

Retrieve paginated browsing logs.

### Response

```json
{
  "total": 125,
  "page": 1,
  "pageSize": 10,
  "data": [
    {
      "url": "example.com",
      "label": "Benign",
      "decision": "Allow",
      "score": 0.12,
      "timestamp": "2026-02-26T10:12:00Z"
    }
  ]
}
```

---

# 👑 Admin Endpoints (Role: Admin)

## Dataset Review

### GET `/api/dataset?status=Pending|Approved|Rejected`

Retrieve dataset entries by status.

### POST `/api/dataset/{id}/approve`

### POST `/api/dataset/{id}/reject`

---

### GET `/api/dataset/export?status=Approved`

Export dataset to CSV.

---

# 🧠 Training (Periodic)

## POST `/api/train/trigger`

Trigger periodic training job.

### Response

```json
{
  "jobId": "train_20260226_01",
  "status": "Running"
}
```

---

## GET `/api/train/jobs`

List training jobs history.

### Response

```json
[
  {
    "jobId": "train_20260226_01",
    "status": "Completed",
    "startedAt": "2026-02-26T10:00:00Z",
    "completedAt": "2026-02-26T10:05:00Z",
    "metrics": {
      "accuracy": 0.94,
      "precision": 0.91,
      "recall": 0.89,
      "f1": 0.90
    }
  }
]
```

---

# 🔐 Role-Based Access

| Endpoint Group | Parent | Admin |
|---|---:|---:|
| Auth | Yes | Yes |
| Settings | Yes | No |
| Scan | Yes | Yes |
| Logs | Yes | No |
| Dataset | No | Yes |
| Training | No | Yes |

---

# 🚦 Standard HTTP Status Codes

- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 500 Internal Server Error

---

Related Docs:
- `/getting-started`
- `/architecture`
- `/ai-training-option-b`
- `/security`
