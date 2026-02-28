---
title: System Architecture
---

# 🏗 System Architecture

ChildSafeNet is a hybrid AI-powered internet safety platform composed
of:

-   Web Application
-   Backend API
-   Database Layer
-   AI Engine
-   Browser Extension (MV3)

The system is designed for real-time URL evaluation, policy enforcement,
auditable logging, and periodic model retraining (Option Periodic).

------------------------------------------------------------------------

# 🌐 High-Level Architecture

ChildSafeNet includes:

-   **React Web App**
-   **ASP.NET Core API**
-   **SQL Server Database**
-   **AI Engine (Hybrid Model)**
-   **Browser Extension (Manifest V3)**

Each component has a clearly defined responsibility to ensure separation
of concerns, scalability, and safe deployment.

------------------------------------------------------------------------

# 🧩 Components

## 1️⃣ React Web (Parent/Admin UI)

Responsibilities:

-   Authentication (Parent/Admin)
-   Protection mode configuration (Strict / Balanced / Relaxed)
-   Whitelist / Blacklist management
-   View Scan Logs
-   Dataset review (Admin)
-   Trigger and monitor training jobs
-   View model metrics and registry

The Web App communicates exclusively with the Backend API via secured
REST endpoints.

------------------------------------------------------------------------

## 2️⃣ ASP.NET Core API

Core responsibilities:

-   Authentication (JWT-based)
-   URL scanning endpoint (`/api/scan`)
-   Parent settings management
-   Logging scan results
-   Dataset collection for retraining
-   Admin dataset review
-   Training job orchestration
-   Model version management

The API acts as the **central control layer** between Extension, AI
Engine, and Database.

------------------------------------------------------------------------

## 3️⃣ SQL Server Database

Main tables:

-   `Users`
-   `UserSettings`
-   `ScanLogs`
-   `UrlDataset`
-   `TrainJobs`
-   `ModelRegistry`

Purpose:

-   Persist all user data and settings
-   Store audit logs for every decision
-   Maintain dataset lifecycle (Pending / Approved / Rejected)
-   Track training history
-   Register model versions and metrics

All decisions are auditable.

------------------------------------------------------------------------

## 4️⃣ AI Engine (Hybrid Model)

ChildSafeNet uses a Hybrid AI approach:

### Random Forest Model

-   58 handcrafted URL features
-   URL length, entropy, symbols, tokens, TLD signals, etc.

### NLP Pipeline

-   TF-IDF or text-based features
-   Focused detection for:
    -   Adult content
    -   Gambling content
    -   General suspicious text signals

### Hybrid Policy Layer

-   Combine RF + NLP scores
-   Apply category thresholds
-   Return:
    -   label
    -   confidence score
    -   decision (Allow / Block)

The AI Engine is invoked by the API during scan requests.

------------------------------------------------------------------------

## 5️⃣ Browser Extension (Manifest V3)

Responsibilities:

-   Detect tab navigation
-   Capture URL metadata
-   Send scan request to API
-   Enforce decision (Allow / Block)
-   Display `block.html` if decision is BLOCK
-   Sync with Parent protection mode

The extension never makes final decisions alone --- enforcement logic
depends on API response.

------------------------------------------------------------------------

# 🔄 Data Flow --- Scan Process

1.  Extension or Web sends:

    -   `url`
    -   `title`
    -   `text` (optional)
    -   `source` to: `/api/scan`

2.  API processes request:

    a)  Apply Whitelist / Blacklist overrides\
    b)  Call AI prediction service\
    c)  Apply Parent Settings policy (mode toggles, thresholds)

3.  API stores:

    -   ScanLog record
    -   UrlDataset entry (Pending --- for Option Periodic)

4.  API returns decision to Extension

5.  If decision = BLOCK:

    -   Extension loads `block.html`

All steps are logged for audit and retraining purposes.

------------------------------------------------------------------------

# 🔁 Option Periodic --- Periodic Training Flow

ChildSafeNet separates data collection from model retraining.

## Step 1: Continuous Collection

-   API stores scanned URLs in `UrlDataset`
-   Initial state: `Pending`

## Step 2: Admin Review

Admin can: - Approve dataset entry - Reject noisy/incorrect samples

Only Approved samples are eligible for training.

## Step 3: Scheduled Training

On schedule (daily / weekly):

-   Merge baseline dataset + approved dataset
-   Train Hybrid model (RF + NLP)
-   Evaluate metrics:
    -   Accuracy
    -   Precision
    -   Recall
    -   F1 Score
-   Save new model artifact

## Step 4: Safe Activation

-   Store model in `ModelRegistry`
-   Keep previous version as fallback
-   Activate only if quality gates pass
-   Roll back if regression detected

This ensures system stability and safe deployment.

------------------------------------------------------------------------

# 🛡 Design Principles

-   Separation of concerns
-   Role-based access control
-   Audit-first logging
-   Stable retraining strategy
-   Safe rollback capability
-   Low-latency inference

------------------------------------------------------------------------

# 📌 Summary

ChildSafeNet architecture ensures:

-   Real-time detection
-   Explainable AI decisions
-   Controlled retraining
-   Full auditability
-   Safe deployment lifecycle

------------------------------------------------------------------------

Related Documentation: - Getting Started - API Reference - AI Training
(Option Periodic) - Security
