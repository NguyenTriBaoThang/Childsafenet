---
title: Parent Guide
---

# 👨‍👩‍👧 Parent Guide

This guide explains how parents use ChildSafeNet to protect children
online.

Main responsibilities:

-   Configure protection rules
-   Monitor browsing logs
-   Pair and control the browser extension
-   Reduce false positives safely

------------------------------------------------------------------------

# 🏠 Main Pages Overview

## 1️⃣ Dashboard

The Dashboard is the control center.

Features:

-   Extension pairing status
-   Enable / Disable protection toggle
-   Current protection mode
-   Latest scan logs
-   Quick access to Settings

------------------------------------------------------------------------

## 2️⃣ Scan Page

Manual URL scanning for testing or verification.

Input fields:

-   URL (required)
-   Title (optional)
-   Page text (optional)

Output:

-   Label (Benign / Phishing / Adult / Gambling / Malware)
-   Score
-   Decision (ALLOW / WARN / BLOCK)

This page is useful for:

-   Testing suspicious links
-   Demonstrating system behavior
-   Debugging false positives

------------------------------------------------------------------------

## 3️⃣ Settings Page

Customize family protection rules.

### 👶 Child Age (1--18)

Age may influence internal threshold logic (if configured).

------------------------------------------------------------------------

### 🎛 Mode Selection

Choose one of:

Strict\
Balanced\
Relaxed

Strict: - Maximum protection - More aggressive blocking

Balanced: - Recommended default - Lower false positives - Good demo
experience

Relaxed: - Warning-first behavior - Fewer hard blocks

------------------------------------------------------------------------

### 🔘 Protection Toggles

Parents can enable or disable:

-   Block Adult
-   Block Gambling
-   Block Phishing
-   Warn Suspicious

This allows fine-grained policy control.

------------------------------------------------------------------------

### ✅ Whitelist

Domains added here:

-   Always ALLOW
-   Override AI decision
-   Useful for school/education websites

Example: school.edu\
google.com

------------------------------------------------------------------------

### ⛔ Blacklist

Domains added here:

-   Always BLOCK
-   Override AI decision

Useful for:

-   Known harmful domains
-   Parent-controlled restrictions

------------------------------------------------------------------------

# 🔗 Extension Pairing (Automatic Flow)

1.  Login to Web Dashboard (JWT token stored)
2.  Click "Kết nối Extension"
3.  Web sends pairing token via window.postMessage
4.  Extension stores token automatically
5.  Status updates to PAIRED

No manual token input required.

------------------------------------------------------------------------

# 🔄 Enable / Disable Protection

Parents can:

-   Toggle protection ON/OFF from Dashboard
-   Disable temporarily if needed
-   Re-enable instantly

When disabled:

-   Extension does not block pages
-   Logging may still occur (depending on configuration)

------------------------------------------------------------------------

# 📉 Tips to Reduce False Positives

To minimize accidental blocking:

1️⃣ Use Balanced mode\
2️⃣ Add trusted domains to Whitelist\
3️⃣ Keep thresholds conservative for Adult/Gambling\
4️⃣ Review logs regularly\
5️⃣ Avoid enabling all strict toggles without testing

------------------------------------------------------------------------

# 📊 Understanding Logs

Each log includes:

-   URL
-   Predicted label
-   Decision
-   Score
-   Timestamp

If a safe site was blocked:

-   Add to Whitelist
-   Adjust mode
-   Report issue if repeated

------------------------------------------------------------------------

# 🛡 Recommended Parent Routine

Weekly:

-   Check logs
-   Review blocked entries
-   Update whitelist if necessary
-   Confirm extension remains paired

------------------------------------------------------------------------

# 🎯 Summary

Parent role focuses on:

-   Policy control
-   Monitoring activity
-   Safe customization
-   Reducing unnecessary blocks

ChildSafeNet gives control to parents while maintaining AI-driven
safety.