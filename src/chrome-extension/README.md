# ChildSafeNet Chrome Extension

The **ChildSafeNet Chrome Extension** provides real-time website protection directly inside the browser.

It monitors visited URLs and communicates with the **ChildSafeNet backend API** to determine whether a website is safe.

If a site is classified as harmful, the extension can:

- display a warning
- block the page
- redirect to a protection screen

The extension is built using **Chrome Extension Manifest V3**.

---

# Features

### Real-Time URL Protection

Every time a user visits a website, the extension checks the URL with the ChildSafeNet API.

If the site is classified as harmful, the extension takes action immediately.

Possible actions:

- Allow browsing
- Show a warning
- Block the website

---

### AI-Powered Detection

The extension itself does not run the AI model.

Instead it sends the URL to the backend system:

```
Browser
   ↓
Extension
   ↓
ChildSafeNet API
   ↓
AI Service
```

The AI system classifies the website and returns the result to the extension.

---

### Block Page

If a site is considered unsafe, the user is redirected to a **block page** explaining why the site was blocked.

The page may show the detected category such as:

- Phishing
- Malware
- Adult content
- Gambling

---

### Popup Interface

The extension popup provides quick information about the current page.

Possible information displayed:

- current website status
- safety category
- protection state
- manual scan button (optional)

---

# Project Structure

```
chrome-extension/
│
├── manifest.json        # Extension configuration (Manifest V3)
│
├── background.js        # Background service worker
│
├── content.js           # Content script injected into webpages
│
├── popup.html           # Extension popup UI
├── popup.js             # Popup logic
│
├── block.html           # Page displayed when a site is blocked
├── block.js             # Block page logic
│
└── README.md
```

---

# How It Works

### Step 1 — Detect Website

When a user visits a website:

```
User opens a webpage
```

The extension captures the URL using the background service worker.

---

### Step 2 — Send Scan Request

The extension sends the URL to the backend API:

```
POST /api/scan
```

Example request:

```json
{
  "url": "http://example.com"
}
```

---

### Step 3 — AI Classification

The backend forwards the URL to the **AI service**.

The AI model classifies the website into categories such as:

- benign
- phishing
- malware
- adult
- gambling

---

### Step 4 — Apply Protection

The API returns a decision:

- **ALLOW**
- **WARN**
- **BLOCK**

If the result is **BLOCK**, the extension redirects the browser to:

```
block.html
```

---

# Installing the Extension (Development)

1. Open Chrome or Edge.

2. Navigate to:

```
chrome://extensions
```

3. Enable **Developer Mode**.

4. Click **Load unpacked**.

5. Select the folder:

```
chrome-extension
```

The extension will now appear in your browser.

---

# Example Workflow

```
User visits website
        ↓
Extension detects URL
        ↓
Send request to API
        ↓
AI Service classifies website
        ↓
API returns decision
        ↓
Extension allows or blocks page
```

---

# Security Model

The extension does not store sensitive user data.

Security measures include:

- remote AI classification
- centralized policy control
- minimal local storage

This design ensures protection rules can be updated from the backend without modifying the extension.

---

# Part of the ChildSafeNet Ecosystem

This extension works together with other system components:

- **ChildSafeNet API** — backend service
- **ChildSafeNet AI Service** — machine learning detection
- **ChildSafeNet Web Dashboard** — parental control interface
- **ChildSafeNet Docs** — technical documentation

---

Built as part of the **ChildSafeNet AI-powered child online safety platform**.
