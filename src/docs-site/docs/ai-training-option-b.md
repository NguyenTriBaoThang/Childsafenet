---
title: AI Training Option Periodic
---

<div class="csnDocHero">
  <div class="csnDocHeroTitle">🧠 AI Training — Periodic</div>
  <p class="csnDocHeroDesc">
    A stable and auditable retraining strategy: collect continuously, review labels, then train on a fixed schedule with quality gates and rollback.
  </p>

  <div class="csnDocChips">
    <span class="csnDocChip">Stable</span>
    <span class="csnDocChip">Reviewed Labels</span>
    <span class="csnDocChip">Rollback-ready</span>
  </div>

  <div class="csnDocHeroActions">
    <a class="csnBtn csnBtnPrimary" href="/user-guide-admin">👑 Admin Guide</a>
    <a class="csnBtn" href="/ml-evaluation-metrics">📊 Evaluation Metrics</a>
    <a class="csnBtn" href="/security">🔐 Security</a>
  </div>
</div>

## Overview

**Periodic Training (Option Periodic)** is designed to keep the model **stable** and the system **fast** while still learning from new data.  
Instead of retraining immediately after each new URL, the system:

- **collects** URL samples continuously,
- requires **admin review** before samples affect training,
- retrains on a **fixed schedule** (daily/weekly),
- releases new models only if they pass **quality gates**,
- keeps a **fallback model** to roll back safely.

---

## Why Periodic?

Training immediately after every new URL can:

- **make models unstable** (drift from noisy updates),
- **introduce noisy labels** (wrong/uncertain ground truth),
- **slow down the system** (training is expensive and can block operations).

Periodic training solves this by separating **data collection** from **model updates**, with a controlled release process.

---

## Data States

During collection and review, each sample belongs to a simple state machine:

- **Pending**: collected but not reviewed yet  
- **Approved**: trusted sample that can be used for training  
- **Rejected**: not used for training (invalid / duplicate / low confidence)

:::tip Recommended rule
Only **Approved** samples are eligible for training.
:::

---

## Pipeline

### 1) Collect URL dataset (Pending)
- Extension/API records:
  - normalized URL
  - predicted label (Adult/Gambling/Phishing/Benign)
  - score/confidence
  - timestamp + source metadata
- Saved as: `Pending`

### 2) Admin Review (Approved / Rejected)
Admin reviews samples and decides:
- **Approve** if label is correct and sample is useful
- **Reject** if:
  - wrong label,
  - unclear content,
  - duplicates,
  - test noise.

### 3) Periodic Training Job
On schedule, the training job will:

- merge **baseline dataset** + **approved dataset**
- run feature extraction:
  - URL features (length, symbols, TLD, tokens…)
  - NLP features (TF-IDF / text-based signals) *(if used)*
- train model:
  - **RF (Random Forest)** + **NLP pipeline**
- evaluate metrics:
  - confusion matrix
  - precision/recall/F1
  - per-class performance
- register new version:
  - save model artifacts
  - version tag (e.g. `v1.2.0`)
  - store metrics snapshot

### 4) Safe Deployment
Before switching to new model:
- keep previous model as **fallback**
- roll out new model only if it passes **quality gates**
- if quality drops or drift is detected → **rollback**

---

## Suggested Schedule

Pick schedule depending on environment:

- **Daily**: best for **demo / rapid iteration**
- **Weekly**: best for **stable production**

:::note Practical suggestion
During competitions/demos: train **daily**, but only when you have enough Approved samples (avoid training on tiny batches).
:::

---

## Quality Gates (Release Checklist)

A new model version is released only if it satisfies:

1) **High precision for block labels**
- Adult / Gambling / Phishing must have **high precision**
- goal: avoid blocking safe websites (trust is critical)

2) **Low false-positive on allowlisted domains**
- allowlisted/trusted domains should rarely be blocked
- monitor allowlist incidents as a priority

3) **No major regression vs previous model**
- compare key metrics to last released version
- if regression exceeds threshold → do not deploy

4) **Operational sanity**
- inference latency stays acceptable
- model size and loading time stable

---

## Minimal Admin Workflow (Fast Demo)

1. Open Admin → Review `Pending`
2. Approve a small set of correct samples
3. Run training job (Periodic)
4. Check metrics summary
5. Publish model version
6. Test: scan a few URLs again and verify decisions/logs

---

## FAQ

**Q: Why not auto-train immediately?**  
A: It can push noisy data into the model and cause unstable behavior + slower system.

**Q: What if we have very few approved samples?**  
A: Skip training until you have enough samples; otherwise the model can overfit.

**Q: How do we ensure safety when deploying new model?**  
A: Use quality gates + keep the previous model as fallback for rollback.

---

## Next

- Admin operations & review: `/user-guide-admin`
- Evaluation metrics explained: `/ml-evaluation-metrics`
- Security & data handling: `/security`