---
title: Admin Guide
---

# 👑 Admin Guide

This guide explains how administrators manage:

-   Dataset review
-   Periodic training (Option Periodic)
-   Model registry
-   System monitoring

Admin access requires role: Admin.

------------------------------------------------------------------------

# 🧩 Admin Pages Overview

## 1️⃣ Admin Dataset

Purpose: Review collected URLs before they are used for retraining.

Features: - View dataset entries by status (Pending / Approved /
Rejected) - Approve URL samples - Reject incorrect/noisy samples -
Export dataset to CSV - Filter/search URLs

------------------------------------------------------------------------

## 2️⃣ Admin Train Jobs

Purpose: Manage periodic training process.

Features: - Trigger training manually - View job history - Monitor job
status (Running / Completed / Failed) - View evaluation metrics -
Confirm model activation

------------------------------------------------------------------------

# 📊 Dataset Workflow

## Step 1 --- Automatic Collection

When a URL is scanned:

-   System logs it in ScanLogs
-   System inserts entry into UrlDataset
-   Default status: Pending

------------------------------------------------------------------------

## Step 2 --- Admin Review

Admin reviews each Pending record.

Possible actions:

Approve: - URL considered valid - Included in next training cycle

Reject: - URL excluded from training - Marked as noisy / incorrect /
duplicate

Only Approved entries affect model retraining.

------------------------------------------------------------------------

## Step 3 --- Export

Admin can export dataset to CSV for:

-   Offline inspection
-   External ML experiments
-   Audit compliance
-   Research documentation

------------------------------------------------------------------------

# 🤖 Training Workflow (Option Periodic)

Periodic training ensures model stability and safety.

## Trigger Methods

-   Manual trigger from Admin UI
-   Scheduled background job (daily / weekly)

------------------------------------------------------------------------

## Training Process

1.  Load baseline dataset
2.  Merge approved dataset entries
3.  Perform feature extraction
4.  Train hybrid model:
    -   Random Forest (URL features)
    -   NLP pipeline (TF-IDF)
5.  Evaluate metrics:
    -   Accuracy
    -   Precision
    -   Recall
    -   F1 Score
6.  Save model artifact
7.  Register model in ModelRegistry

------------------------------------------------------------------------

# 🧪 Evaluation & Quality Gates

Before activation, model must satisfy:

-   High precision for block categories
-   Acceptable recall for harmful classes
-   No major regression vs previous version
-   Acceptable false-positive rate

If quality gates fail: - Model is not activated - Previous version
remains active

------------------------------------------------------------------------

# 🔄 Model Registry

ModelRegistry stores:

-   Model version
-   Training date
-   Dataset size
-   Evaluation metrics
-   Activation status
-   Notes

Only one model should be active at a time.

------------------------------------------------------------------------

# 📈 Monitoring & Audit

Admins should regularly:

-   Review dataset inflow
-   Monitor false positives
-   Check drift patterns
-   Validate training metrics
-   Verify model activation logs

------------------------------------------------------------------------

# ⚠ Best Practices

-   Do not approve noisy samples
-   Avoid training with too few samples
-   Keep baseline dataset stable
-   Document each model version
-   Maintain rollback readiness

------------------------------------------------------------------------

# 🛡 Security Considerations

-   Admin endpoints must be protected by role-based authorization
-   All admin actions should be logged
-   Training trigger must not be publicly accessible
-   Dataset manipulation must be audited

------------------------------------------------------------------------

# 🎯 Recommended Admin Routine

Weekly:

1.  Review pending dataset
2.  Approve clean samples
3.  Trigger training
4.  Review metrics
5.  Activate new model (if qualified)

This ensures stable AI evolution without sacrificing safety.

------------------------------------------------------------------------

# 📌 Summary

Admin responsibilities include:

-   Dataset governance
-   Safe model lifecycle management
-   Audit tracking
-   Ensuring system stability

The goal is controlled AI improvement, not rapid uncontrolled updates.