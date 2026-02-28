---
title: Product Backlog
---

# 📋 Product Backlog

This document outlines the high-level product backlog for ChildSafeNet,
organized by phases, epics, and representative tasks.

The backlog is structured to support: - Clear development milestones -
Role-based ownership - AI lifecycle control - Release readiness

------------------------------------------------------------------------

# 🏷 Recommended Labels

Use consistent GitHub issue labels to improve tracking and filtering:

-   `setup`
-   `backend`
-   `frontend`
-   `extension`
-   `ai`
-   `docs`
-   `security`
-   `devops`

Optional advanced labels: - `bug` - `enhancement` - `performance` -
`refactor` - `good-first-issue`

------------------------------------------------------------------------

# 🗂 Backlog Roadmap (High-Level)

  -----------------------------------------------------------------------
  Phase         Epic        Example Tasks                 Labels
  ------------- ----------- ----------------------------- ---------------
  Phase 1       Core System Auth, Settings, Scan, Logs    backend,
                                                          frontend

  Phase 2       AI &        Hybrid AI, MV3 extension,     ai, extension
                Extension   pairing                       

  Phase 3       Admin &     Dataset review, Train jobs,   backend,
                Training    Model registry                frontend, ai

  Phase 4       Docs &      Docs site, Wiki, Release      docs
                Release     notes                         

  Phase 5       DevOps &    CI, Docker, Security headers  devops,
                Hardening                                 security
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 🚀 Phase 1 --- Core System

## Epic: Authentication & Authorization

Tasks: - JWT-based authentication - Role separation (Parent / Admin) -
Password hashing & validation - Protected routes

Labels: `backend`, `security`

## Epic: Parent Settings

Tasks: - Strict / Balanced / Relaxed modes - Whitelist & blacklist -
Protection toggle - Settings persistence

Labels: `backend`, `frontend`

## Epic: Scan & Logs

Tasks: - `/api/scan` endpoint - ScanLog database table - Paginated logs
API - Logs dashboard UI

Labels: `backend`, `frontend`

------------------------------------------------------------------------

# 🤖 Phase 2 --- AI & Extension

## Epic: Hybrid AI Engine

Tasks: - 58 handcrafted URL features (RF) - NLP pipeline (TF-IDF) -
Score aggregation logic - Threshold configuration - Model serialization

Labels: `ai`

## Epic: Browser Extension (MV3)

Tasks: - Navigation listener - API scan request - Pairing token flow -
Block page (`block.html`) - Mode synchronization

Labels: `extension`, `frontend`

------------------------------------------------------------------------

# 👑 Phase 3 --- Admin & Training

## Epic: Dataset Review

Tasks: - `UrlDataset` schema - Approve / Reject endpoints - Admin review
UI - Dataset export (CSV)

Labels: `backend`, `frontend`, `ai`

## Epic: Periodic Training (Option Periodic)

Tasks: - Background training job - Merge baseline + approved dataset -
Evaluation metrics computation - Model registry storage - Safe
activation logic - Rollback support

Labels: `backend`, `ai`

------------------------------------------------------------------------

# 📚 Phase 4 --- Docs & Release

## Epic: Documentation Site

Tasks: - Docusaurus setup - Architecture documentation - API Reference -
Training Option Periodic documentation - User guides (Parent/Admin)

Labels: `docs`

## Epic: Release Preparation

Tasks: - Version tagging - Changelog - Demo script preparation -
Competition submission checklist

Labels: `docs`

------------------------------------------------------------------------

# ⚙ Phase 5 --- DevOps & Hardening

## Epic: CI/CD

Tasks: - GitHub Actions pipeline - Build validation - Test execution -
Lint checks

Labels: `devops`

## Epic: Containerization

Tasks: - Dockerfile for API - Docker Compose (API + SQL) - Environment
configuration

Labels: `devops`

## Epic: Security Hardening

Tasks: - HTTPS enforcement - Security headers - Rate limiting -
Role-based endpoint validation - Audit logging

Labels: `security`

------------------------------------------------------------------------

# 🎯 Definition of Done (DoD)

A backlog item is considered complete when:

-   Code is implemented
-   Unit tests pass
-   Security checks pass
-   Reviewed & merged
-   Documented if applicable
-   No critical regression introduced

------------------------------------------------------------------------

# 📌 Long-Term Vision (Post-Release)

-   Model drift detection
-   Online evaluation dashboard
-   Multi-device management
-   Explainability visualization (feature importance UI)
-   Advanced threat intelligence integration

------------------------------------------------------------------------

This backlog is intended to evolve as the product matures. Regular
refinement sessions are recommended.