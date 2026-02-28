---
title: Browser Extension
---

# 🧩 Browser Extension (Manifest V3)

The ChildSafeNet browser extension enforces real-time URL protection by
communicating with the backend API and applying blocking decisions based
on Parent settings and AI predictions.

------------------------------------------------------------------------

# 🌍 Supported Browsers

-   Google Chrome (Chromium-based)
-   Microsoft Edge (Chromium-based)

The extension uses **Manifest V3 (MV3)** architecture with a background
service worker.

------------------------------------------------------------------------

# ⚙ Installation (Developer Mode)

## Step 1

Open: - Chrome → `chrome://extensions` - Edge → `edge://extensions`

## Step 2

Enable **Developer mode** (top-right toggle)

## Step 3

Click **Load unpacked**

## Step 4

Select the project folder:

`chrome-extension/`

After installation, ensure: - Extension is enabled - No errors appear in
extension card

------------------------------------------------------------------------

# 🔗 Pairing Flow

The extension must be paired with the Web Dashboard before protection is
active.

## Flow Overview

1.  Web Dashboard generates pairing token
2.  Dashboard sends token to extension via: `window.postMessage`
3.  Content script listens and forwards token to background service
    worker
4.  Background stores token in: `chrome.storage.local`
5.  Extension responds with: `CSN_PAIR_RESULT`
6.  Dashboard updates status (Paired / Failed)

------------------------------------------------------------------------

# 🔐 Storage

The extension stores:

-   Pairing token
-   Mode sync state
-   API base URL (if configurable)

Stored in:

`chrome.storage.local`

No sensitive data should be stored in plaintext beyond necessary tokens.

------------------------------------------------------------------------

# 🛡 Scan Flow (Runtime)

1.  User navigates to a new URL
2.  Extension captures tab update event
3.  Background sends request to `/api/scan`
4.  API returns decision
5.  If decision = BLOCK:
    -   Extension redirects to `block.html`
6.  If decision = ALLOW:
    -   Page loads normally
7.  Scan result logged on backend

The extension does not decide independently --- the API is
authoritative.

------------------------------------------------------------------------

# 🔄 Enable / Disable Protection

You can toggle protection:

-   From Web Dashboard (recommended)
-   From Extension popup (if implemented)

When disabled: - Extension may still log URLs (optional) - Blocking is
skipped

------------------------------------------------------------------------

# ❗ Common Issues & Troubleshooting

## NOT READY

Meaning: Content script not injected.

Fix: - Check `host_permissions` in `manifest.json` - Reload extension -
Reload page

------------------------------------------------------------------------

## Pair failed / Port closed

Possible causes: - Background service worker stopped - API unreachable -
Token expired - Runtime error

Fix: 1. Open extension details 2. Click **Service Worker** 3. Open
console and inspect logs 4. Verify API URL and CORS configuration

------------------------------------------------------------------------

## No logs appear in dashboard

Check: - JWT token valid - Pairing successful - Correct user account -
API reachable

------------------------------------------------------------------------

# 🧠 Security Notes

-   Use HTTPS in production
-   Do not expose API keys in extension
-   Validate all responses server-side
-   Limit CORS origins

------------------------------------------------------------------------

# 📦 Manifest V3 Key Components

-   manifest.json
-   background.js (service worker)
-   content.js
-   popup.html / popup.js (optional)
-   block.html

------------------------------------------------------------------------

# 🎯 Best Practices

-   Keep service worker lightweight
-   Avoid long-running blocking tasks
-   Handle network errors gracefully
-   Implement retry logic if needed
-   Provide clear UX for blocked pages

------------------------------------------------------------------------

# 🔗 Related Documentation

-   Getting Started
-   API Reference
-   System Architecture
-   Security