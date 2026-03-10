# ChildSafeNet AI Service

The **ChildSafeNet AI Service** is the machine learning component responsible for detecting harmful websites.

This service analyzes URLs and predicts whether a website belongs to a dangerous category such as phishing, malware, adult content, or gambling.

It operates as a **Python microservice** and is called by the **ChildSafeNet ASP.NET Core API** to perform real-time risk classification.

---

# Purpose

The AI service provides automated detection for unsafe websites to protect children while browsing the internet.

It enables the platform to identify threats such as:

- Phishing websites
- Malware distribution sites
- Adult content
- Gambling platforms
- Suspicious or unknown domains

The predictions are used by the backend API to determine whether a website should be **allowed, warned, or blocked**.

---

# Tech Stack

- **Python**
- **FastAPI / Flask (lightweight inference service)**
- **Scikit-learn**
- **Machine Learning Classification Models**
- **Docker**

---

# Project Structure

```
ai-service/
│
├── model/                 # Trained ML models
│
├── model-training/        # Training scripts and notebooks
│
├── web/                   # Web API logic (routes / helpers)
│
├── app.py                 # Main AI service entry point
│
├── requirements.txt       # Python dependencies
│
├── Dockerfile             # Docker container configuration
│
└── README.md
```

---

# How It Works

The AI service performs classification using a trained machine learning model.

### Step 1 — Receive URL

The backend API sends a request:

```
POST /predict
```

Example request:

```json
{
  "url": "http://example.com"
}
```

---

### Step 2 — Feature Extraction

The system extracts features from the URL such as:

- URL length
- presence of suspicious keywords
- number of special characters
- domain structure
- entropy indicators

These features help identify patterns commonly used in malicious websites.

---

### Step 3 — Model Prediction

The trained model predicts one of the following categories:

- `benign`
- `phishing`
- `malware`
- `adult`
- `gambling`

Example response:

```json
{
  "category": "phishing",
  "confidence": 0.91
}
```

---

### Step 4 — Backend Decision

The **ChildSafeNet API** receives the prediction and combines it with parental rules to produce the final decision:

- **ALLOW**
- **WARN**
- **BLOCK**

---

# Running the AI Service Locally

### 1 Install dependencies

```bash
pip install -r requirements.txt
```

---

### 2 Start the service

```bash
python app.py
```

Default server:

```
http://localhost:8000
```

---

# Example API Request

Using `curl`:

```bash
curl -X POST http://localhost:8000/predict \
-H "Content-Type: application/json" \
-d '{"url":"http://example.com"}'
```

Example response:

```json
{
  "category": "benign",
  "confidence": 0.97
}
```

---

# Model Training

The `model-training` directory contains scripts used to train the classification model.

Typical training workflow:

1. Collect labeled dataset
2. Extract URL features
3. Train classification models
4. Evaluate metrics (accuracy, precision, recall, F1)
5. Export trained model

The final model is saved inside the **model/** directory and loaded by the inference service.

---

# Docker

The AI service can run inside a Docker container.

Build image:

```bash
docker build -t childsafenet-ai .
```

Run container:

```bash
docker run -p 8000:8000 childsafenet-ai
```

---

# Integration with ChildSafeNet Platform

The AI service is part of the full ChildSafeNet architecture.

```
Browser Extension
        ↓
ChildSafeNet API
        ↓
AI Service (ML Model)
        ↓
Prediction Result
        ↓
Allow / Warn / Block
```

This design separates **machine learning inference** from the main API, allowing the AI model to scale independently.

---

# Goal

The goal of this service is to provide **fast and accurate AI-based website risk detection** to help build a safer online environment for children.

---

Built as part of the **ChildSafeNet AI-powered child cybersecurity platform**.
