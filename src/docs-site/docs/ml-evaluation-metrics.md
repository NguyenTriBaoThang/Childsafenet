---
title: ML Evaluation Metrics
---

# 📊 ML Evaluation Metrics

ChildSafeNet uses multi-class classification to detect:

-   Benign
-   Phishing
-   Malware
-   Adult
-   Gambling

Because this is a safety-critical system, evaluation is not only about
accuracy, but also about minimizing harmful mistakes.

------------------------------------------------------------------------

# 🎯 Classification Metrics

## 1️⃣ Accuracy

Accuracy measures overall correctness:

Accuracy = (TP + TN) / Total

Limitation: - Can be misleading when dataset is imbalanced. - High
accuracy does NOT guarantee good performance for rare harmful classes.

------------------------------------------------------------------------

## 2️⃣ Precision

Precision measures how many predicted positives are actually correct:

Precision = TP / (TP + FP)

In child safety systems, **precision for blocking categories is
critical**.

High precision means: - Fewer safe websites are blocked incorrectly. -
Higher trust for parents.

------------------------------------------------------------------------

## 3️⃣ Recall

Recall measures how many real harmful cases were detected:

Recall = TP / (TP + FN)

Higher recall means: - More harmful sites detected. - Fewer dangerous
sites slip through.

Trade-off: - Increasing recall can lower precision.

------------------------------------------------------------------------

## 4️⃣ F1 Score

F1 = 2 \* (Precision \* Recall) / (Precision + Recall)

Used when: - Need balance between precision and recall. - Dataset is
imbalanced.

------------------------------------------------------------------------

# 🧮 Multi-Class Evaluation

For multi-class detection:

-   Calculate metrics per class
-   Use Macro F1 (average of class F1)
-   Use Weighted F1 (weighted by support)

Example focus classes:

-   Phishing
-   Adult
-   Gambling
-   Malware

Benign class is important but safety classes must be prioritized.

------------------------------------------------------------------------

# 📉 Confusion Matrix

Confusion matrix shows:

-   True Positive
-   False Positive
-   True Negative
-   False Negative

In multi-class setup:

Rows = Actual class\
Columns = Predicted class

Use confusion matrix to:

-   Identify class confusion patterns
-   Detect over-blocking behavior
-   Detect under-detection of harmful categories

Example issue:

Benign misclassified as Adult → False Positive (bad UX)\
Phishing misclassified as Benign → False Negative (security risk)

------------------------------------------------------------------------

# 🛡 Safety Priority Strategy

In child safety:

1️⃣ Prefer HIGH precision for BLOCK categories\
- Avoid blocking educational/safe sites

2️⃣ Maintain acceptable recall for harmful classes\
- Do not allow too many dangerous sites through

3️⃣ Monitor false-positive rate on whitelist domains

4️⃣ Track category-level metrics independently

------------------------------------------------------------------------

# 🎚 Thresholding Strategy

For probabilistic models:

Example thresholds:

-   BLOCK if score ≥ 0.85
-   WARN if 0.60 ≤ score \< 0.85
-   ALLOW if score \< 0.60

Rules:

-   Whitelist always overrides to ALLOW
-   Blacklist always overrides to BLOCK
-   Thresholds configurable in system settings

------------------------------------------------------------------------

# 🔄 Model Comparison (Before Release)

Before activating a new model version:

Compare against previous version:

-   Accuracy
-   Precision (block classes)
-   Recall (block classes)
-   F1 score
-   False positive rate
-   Inference latency

Reject deployment if:

-   Precision drops significantly
-   False positives increase sharply
-   Recall for harmful categories decreases too much

------------------------------------------------------------------------

# 📦 Suggested Reporting Template

When logging a new model version:

-   Model Version ID
-   Training Date
-   Dataset Size
-   Accuracy
-   Macro F1
-   Precision (Adult / Gambling / Phishing)
-   Recall (Adult / Gambling / Phishing)
-   False Positive Rate
-   Notes

Store in: ModelRegistry table

------------------------------------------------------------------------

# 🚀 Long-Term Improvements

-   ROC curve analysis
-   Precision-Recall curves
-   Drift detection monitoring
-   Per-category threshold tuning
-   Online evaluation dashboard

------------------------------------------------------------------------

# 📌 Summary

ChildSafeNet evaluation focuses on:

-   Precision-first safety
-   Controlled recall
-   Threshold-based decision control
-   Safe model versioning
-   Auditable metrics tracking

The goal is not maximum accuracy, but maximum safe and trustworthy
behavior.