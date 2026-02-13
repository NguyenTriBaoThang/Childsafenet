# AI Engine

## Hybrid Model

ChildSafeNet uses a hybrid detection approach:

### 1️⃣ Random Forest (58 URL Features)
- URL length
- Entropy
- Suspicious words
- Subdomain count
- Digit ratio

### 2️⃣ NLP Pipeline
- TF-IDF
- Logistic Regression
- Text classification

---

## Decision Logic

1. Adult/Gambling → BLOCK if confidence ≥ 0.85
2. Phishing/Malware → BLOCK if ≥ 0.75
3. Suspicious → WARN
4. Else → ALLOW

---

## Retraining Strategy

Option B – Scheduled Retraining:

- Collect dataset (Pending)
- Admin approves
- Train weekly or manually
- Replace model version