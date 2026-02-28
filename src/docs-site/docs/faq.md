---
title: FAQ
---

# ❓ Frequently Asked Questions

This page covers common issues, deployment questions, and operational concerns related to ChildSafeNet (Web, API, AI, and Extension).

---

# 🔗 Extension & Pairing

## Why does Pair fail on Microsoft Edge?

Edge is Chromium-based, but its service worker may stop quickly when idle.

Check the following:

- Extension is loaded and enabled
- Service Worker console has no runtime errors
- `host_permissions` in `manifest.json` include the target domain
- API URL is correct and reachable
- CORS is properly configured

How to debug:

1. Open `edge://extensions`
2. Click your extension
3. Open **Service Worker**
4. Inspect console logs

---

## Why does Pair fail with "port closed" error?

Possible causes:

- Background service worker stopped
- API unreachable
- Invalid or expired pairing token
- Runtime exception in background script

Fix:

- Reload extension
- Regenerate pairing token
- Check API logs
- Verify JWT authentication

---

## Why does extension show NOT READY?

This means the content script was not injected.

Possible causes:

- Missing `host_permissions`
- Page loaded before extension initialized
- Extension disabled

Fix:

- Reload extension
- Reload page
- Check manifest configuration

---

# 🌐 Deployment & Docs

## Can I deploy docs to GitHub Pages?

Yes.

Use GitHub Actions to:

1. Build Docusaurus site
2. Deploy to `gh-pages` branch
3. Configure repository settings → Pages → Source = `gh-pages`

Ensure:

- `baseUrl` in `docusaurus.config.js` matches your repo name
- `url` is set to your GitHub Pages domain

Example:

```js
// docusaurus.config.js
url: "https://YOUR_USERNAME.github.io",
baseUrl: "/YOUR_REPO/",
```

---

## Why does GitHub Pages show 404?

Check:

- `baseUrl` is correct
- GitHub Pages branch selected properly
- No hardcoded paths in links
- Use `useBaseUrl()` for images and static assets

---

# 🤖 AI & Training

## Why not train after every new URL?

Immediate retraining can:

- Introduce noisy labels
- Cause model instability
- Slow down system

Use Periodic Training (Option Periodic) instead.

---

## What if the new model performs worse?

The system keeps the previous model as fallback.

If quality gates fail:

- Do not activate new model
- Roll back to previous version

---

## How do I measure model quality?

Check:

- Accuracy
- Precision (especially for Block categories)
- Recall
- F1 Score
- False-positive rate on trusted domains

---

# 🔐 Security

## Is user browsing data stored?

Only necessary metadata is stored:

- URL
- Prediction result
- Timestamp

No full page content should be stored.

---

## How do I secure the API?

- Use HTTPS
- Use JWT authentication
- Restrict admin endpoints
- Enable CORS policy
- Add rate limiting

---

# ⚙ Development

## How do I run full system locally?

1. Start SQL Server
2. Run API
3. Run Web app
4. Install extension (Developer mode)
5. Pair extension
6. Trigger scan

---

## How do I reset database?

- Drop database
- Re-run migrations
- Seed baseline dataset (if required)

---

# 📦 Miscellaneous

## Can this system scale?

Yes, with improvements:

- Move AI engine to separate service
- Add caching layer
- Use message queue for training jobs
- Deploy database with proper indexing

---

If your issue is not listed here:

- Check logs (API + Extension)
- Review Security page
- Open a GitHub Issue with detailed steps