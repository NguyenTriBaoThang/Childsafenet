# 🧠 ChildSafeNet --- AI Training Wiki

## 1. Introduction

ChildSafeNet is an AI-powered web safety system designed to protect
children from harmful online content including:

-   Adult content
-   Gambling sites
-   Phishing attacks
-   Suspicious domains

The AI engine combines: - URL feature engineering - Text-based NLP
analysis - Machine learning classification - Human-reviewed dataset
pipeline (Option B periodic retraining)

------------------------------------------------------------------------

## 2. AI Training Pipeline

### 2.1 Data Collection

Sources: - Public phishing datasets - Malicious URL repositories -
Internal logs from Extension/Web Scan - Admin-reviewed approved dataset

Dataset Structure:

  Field       Description
  ----------- --------------------------------------
  url         Full URL
  label       phishing / adult / gambling / benign
  source      Web / Extension
  reviewed    Boolean (admin validated)
  createdAt   Timestamp

------------------------------------------------------------------------

### 2.2 Feature Engineering

We extract two groups of features:

#### URL-based Features

-   URL length
-   Number of dots
-   Number of hyphens
-   Presence of '@'
-   Query parameters count
-   Domain length
-   Suspicious keyword flags

#### Text-based Features

-   TF-IDF vectorization
-   N-grams (1-2 grams)
-   HTML title signals
-   Content keyword density

------------------------------------------------------------------------

### 2.3 Model Architecture

Baseline Models Tested:

-   Logistic Regression
-   Random Forest
-   XGBoost
-   BiLSTM (NLP experiment)

Final Selected Model (v1): Random Forest + URL Features + TF-IDF (1000
features)

Reason: - Fast inference - Good balance between precision and recall -
Low memory usage - Suitable for browser extension latency

------------------------------------------------------------------------

## 3. ML Evaluation Metrics

### 3.1 Accuracy

Accuracy = (TP + TN) / Total

Used for general performance overview.

### 3.2 Precision

Precision = TP / (TP + FP)

Important because: We want to minimize false blocking of safe websites.

### 3.3 Recall

Recall = TP / (TP + FN)

Important because: We must detect harmful sites effectively.

### 3.4 F1 Score

F1 = 2 × (Precision × Recall) / (Precision + Recall)

Used for balanced evaluation.

### 3.5 ROC-AUC

Measures model separability capability.

Target Benchmarks:

  Metric      Target
  ----------- ---------
  Accuracy    \> 90%
  Precision   \> 88%
  Recall      \> 85%
  F1          \> 0.86

------------------------------------------------------------------------

## 4. Option B --- Periodic Retraining Strategy

Instead of training instantly:

1.  URLs collected → Stored as Pending
2.  Admin approves/rejects
3.  Approved data appended to dataset
4.  Scheduled job retrains model weekly
5.  New model version stored

Advantages: - Avoid data poisoning - Improve stability - Controlled
model evolution

------------------------------------------------------------------------

## 5. Model Versioning

Model Storage Structure:

/models/ - model_v1.pkl - model_v2.pkl - metadata.json

metadata.json contains: - Training date - Dataset size - Metrics -
Feature config

------------------------------------------------------------------------

## 6. Drift Monitoring

Drift Indicators: - Increased WARN/BLOCK ratio - Sudden drop in
confidence scores - High false positive reports

Future Plan: - Statistical KL divergence monitoring - Automated retrain
trigger - CI integration for model tests

------------------------------------------------------------------------

## 7. Future Microservice Roadmap

Planned AI Microservices:

1.  AI Inference Service
    -   Dedicated FastAPI model server
2.  Training Service
    -   Background job scheduler
    -   Model registry
3.  Drift Monitoring Service
    -   Data statistics analysis
    -   Alerting system
4.  Explainability Service
    -   SHAP/LIME explanation API

------------------------------------------------------------------------

## 8. Security Considerations

-   Dataset validation before training
-   JWT authentication for training trigger
-   Admin-only dataset approval
-   Model file checksum verification

------------------------------------------------------------------------

## 9. Final Academic Submission Notes

This AI pipeline demonstrates:

-   Practical ML lifecycle management
-   Real-world browser integration
-   Secure dataset governance
-   Controlled retraining architecture
-   Production-ready system thinking

ChildSafeNet is not only a demo classifier, but a structured AI system
following modern MLOps principles.

------------------------------------------------------------------------

Author: Nguyen Tri Bao Thang Project: ChildSafeNet Technology Stack:
ASP.NET Core + React + SQL Server + Python ML