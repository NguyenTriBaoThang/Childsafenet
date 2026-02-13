# Dataset & Retraining

## Data Collection

When a URL is scanned:
→ Stored in UrlDataset table
→ Status = Pending

---

## Approval Process

Admin reviews:
- Approve
- Reject

---

## Train Job

Manual trigger:
POST /api/train/trigger

---

## Model Versioning

Each trained model:
- version number
- created_at
- metrics