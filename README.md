<p align="center">
    <img loading="lazy" src="./assets/images/IMG_LOGO.png"EduProjectSpace" height="150">
</p>

# 🛡️ ChildSafeNet

AI-Powered Internet Safety Platform for Children\
Full-stack system: ASP.NET Core + React + Chrome Extension + ML Pipeline

------------------------------------------------------------------------

## 📌 Overview

ChildSafeNet is an AI-driven web protection system designed to:

-   Detect and block malicious or inappropriate websites
-   Protect children from adult, gambling, phishing, and malware content
-   Allow parents to customize protection rules
-   Continuously improve via periodic model retraining (Option B --
    Scheduled Training)

------------------------------------------------------------------------

## 🏗️ System Architecture

Components:

-   **Frontend (React + TypeScript)**
-   **Backend API (ASP.NET Core 8)**
-   **SQL Server (Local or Docker)**
-   **AI Service (Python FastAPI -- Hybrid RF + TF-IDF Model)**
-   **Chrome Extension (Content Scanner & Blocker)**
-   **Scheduled Model Training Pipeline**

------------------------------------------------------------------------

## 🔐 Key Features

### 👨‍👩‍👧 Parent Controls

-   Child Age configuration
-   Mode: Strict / Balanced / Relaxed
-   Rule toggles:
    -   Block Adult
    -   Block Gambling
    -   Block Phishing
    -   Warn Suspicious
-   Whitelist / Blacklist domains
-   Saved per user

------------------------------------------------------------------------

### 🧠 AI Classification Engine

Hybrid Model:

-   RandomForest (58 handcrafted URL features)
-   TF-IDF + Logistic Regression
-   Combined decision logic with threshold control

Categories:

-   Benign
-   Phishing
-   Malware
-   Adult
-   Gambling

------------------------------------------------------------------------

### 🔄 Option B -- Periodic Training

-   URLs collected from scans
-   Admin approves dataset
-   Scheduled retraining job
-   New model version deployed automatically

------------------------------------------------------------------------

## 🚀 Tech Stack

### Backend

-   ASP.NET Core 8
-   Entity Framework Core
-   SQL Server
-   JWT Authentication
-   REST API

### Frontend

-   React + TypeScript (Vite)
-   Axios
-   Role-based routing (Admin / Parent)

### AI Service

-   Python
-   Scikit-learn
-   FastAPI
-   Joblib

### DevOps

-   Docker & Docker Compose
-   GitHub Actions CI
-   Model versioning
-   Drift monitoring support

------------------------------------------------------------------------

## 📂 Project Structure

ChildSafeNet/ ├── Childsafenet.Api/ ├── Childsafenet.Frontend/ ├──
ai-service/ ├── chrome-extension/ ├── docker-compose.yml └── README.md

------------------------------------------------------------------------

## 🐳 Run with Docker

``` bash
docker compose up -d --build
```

API: https://localhost:7047\
Frontend: http://localhost:5173

------------------------------------------------------------------------

## 💻 Run Locally (No Docker)

### Backend

``` bash
cd Childsafenet.Api
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend

``` bash
cd Childsafenet.Frontend
npm install
npm run dev
```

------------------------------------------------------------------------

## 🔄 CI/CD Pipeline

-   Build API
-   Build Frontend
-   Run tests
-   Build Docker images
-   Deploy
-   Drift detection
-   Model version update

------------------------------------------------------------------------

## 🛡️ Security

-   JWT-based authentication
-   Role-based access (Admin / Parent)
-   Security headers middleware
-   Dataset approval workflow
-   Controlled model deployment

------------------------------------------------------------------------

## 📊 Roadmap

-   Model explainability dashboard
-   Real-time drift alerting
-   Parent activity insights
-   Multi-child profile support
-   Cloud deployment

------------------------------------------------------------------------

## 👨‍💻 Authors

Developed by: TKT TEAM\
AI Web Safety Research Project

------------------------------------------------------------------------

## 📜 License

MIT License