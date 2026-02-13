# System Architecture

## Overview

ChildSafeNet follows a multi-layer architecture:

User → Chrome Extension → Web API → AI Engine → Database

---

## Components

### 1. Frontend (React)
- Dashboard
- Settings
- Logs
- Admin Panel

### 2. Backend (ASP.NET Core)
- Authentication (JWT)
- Settings Management
- Dataset Management
- Logs
- Train Trigger

### 3. AI Engine (Python FastAPI)
- RandomForest (URL features)
- NLP Pipeline (adult/gambling detection)
- Hybrid decision engine

### 4. Database (SQL Server)
- Users
- UserSettings
- ScanLogs
- UrlDataset
- TrainJobs

---

## Architecture Diagram

Refer to `/assets/childsafenet_system_architecture.png`