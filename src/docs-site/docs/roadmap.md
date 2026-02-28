---
slug: /roadmap
title: Roadmap
---

# 🗺 Product Roadmap

This roadmap outlines the evolution of ChildSafeNet from core prototype
to final submission and beyond.

The roadmap is structured by major versions to reflect architectural
growth, AI maturity, and operational stability.

------------------------------------------------------------------------

# 🚀 v1.0.0 --- Core Web (No Extension)

Focus: Foundational backend + web dashboard.

## 🎯 Goals

-   Establish secure authentication
-   Implement basic scan functionality
-   Store logs in database
-   Provide parent configuration

## 🔧 Features

-   JWT-based Authentication
-   Parent Settings (Strict / Balanced / Relaxed)
-   Manual URL Scan page
-   Scan Logs dashboard
-   SQL Server schema (Users, Settings, Logs)

## 📌 Outcome

Fully working Web + API system without browser automation.

------------------------------------------------------------------------

# 🧩 v2.0.0 --- Extension Integration

Focus: Real-time browser enforcement.

## 🎯 Goals

-   Integrate MV3 browser extension
-   Enable Web ↔ Extension pairing
-   Implement automatic blocking

## 🔧 Features

-   MV3 Extension (Chrome/Edge)
-   Pair token flow (window.postMessage → background)
-   Real-time `/api/scan` calls
-   `block.html` for blocked pages
-   Mode synchronization between Web and Extension

## 📌 Outcome

End-to-end protection: Navigation → API → AI → Decision → Block → Log.

------------------------------------------------------------------------

# 🧠 v3.0.0 --- Final Submission Edition

Focus: AI lifecycle + documentation + operational maturity.

## 🎯 Goals

-   Introduce controlled retraining
-   Improve model governance
-   Prepare competition-ready documentation
-   Automate CI pipeline

## 🔧 Features

-   Admin Dataset Review (Pending / Approved / Rejected)
-   Periodic Training (Option Periodic)
-   Model Registry with versioning
-   Safe activation + rollback logic
-   Docs site (Docusaurus)
-   Architecture diagrams
-   Release checklist templates
-   GitHub Actions CI workflow

## 📌 Outcome

Stable, auditable, competition-ready AI safety system.

------------------------------------------------------------------------

# ☁ Post-Submission Vision

Focus: Scalability and production-readiness.

## 🌍 Cloud Deployment

-   Azure App Service for API
-   Azure SQL Database
-   Blob storage for model artifacts
-   HTTPS + managed identity

## 📈 Model Monitoring

-   Drift detection metrics
-   False-positive tracking dashboard
-   Auto-switch to fallback model
-   Performance telemetry

## 📱 Mobile Parent App

-   View logs on mobile
-   Push notifications for blocked sites
-   Real-time mode toggling

## 🔬 Future AI Enhancements

-   Online learning experimentation
-   ROC curve-based threshold tuning
-   Explainability UI (feature importance)
-   Threat intelligence feeds integration

------------------------------------------------------------------------

# 📊 Versioning Philosophy

ChildSafeNet follows semantic versioning:

MAJOR.MINOR.PATCH

-   MAJOR: Architectural change or new subsystem
-   MINOR: Feature addition
-   PATCH: Bug fixes / small improvements

------------------------------------------------------------------------

# 🎯 Long-Term Goal

Build a trustworthy, explainable, and scalable child internet safety
platform that prioritizes:

-   Stability over rapid change
-   Precision-first safety
-   Auditability
-   Safe AI deployment lifecycle

------------------------------------------------------------------------

This roadmap is iterative and may evolve based on research, feedback,
and deployment constraints.