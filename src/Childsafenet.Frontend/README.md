# ChildSafeNet Frontend

This directory contains the **web dashboard interface** for the ChildSafeNet platform.

The frontend provides a **parent control panel** where users can scan URLs, view browsing activity, configure protection rules, and connect the browser extension.

The application is built with **React + TypeScript + Vite** and communicates with the **ChildSafeNet ASP.NET Core API**.

---

# Tech Stack

- **React 18**
- **TypeScript**
- **Vite**
- **Axios**
- **React Router**
- **Modern CSS**

---

# Features

The ChildSafeNet dashboard provides several key features.

### URL Scan

Parents can manually scan a website to check whether it is safe.

The system sends the URL to the backend API which uses the AI model to classify the site.

Possible results include:

- **Allow**
- **Warn**
- **Block**

---

### Scan History

The dashboard stores scan logs so parents can review browsing activity.

This helps monitor which sites have been checked or flagged.

---

### Parental Settings

Parents can configure protection policies.

Settings include:

- **Child Age (1–18)**

- **Protection Mode**
  - Strict
  - Balanced
  - Relaxed

- **Protection Toggles**
  - Block Adult content
  - Block Gambling
  - Block Phishing
  - Warn suspicious websites

---

### Domain Rules

Parents can override the AI decision by defining domain rules.

**Allowlist**

- Always allow selected domains

**Blocklist**

- Always block selected domains

---

### Browser Extension Integration

The dashboard can pair with the **ChildSafeNet Chrome Extension**.

Once connected:

- The extension automatically scans visited websites
- Protection rules from the dashboard are applied
- Unsafe sites can be blocked or warned in real time

---

# Project Structure

```
Childsafenet.Frontend/
│
├── dist/                # Production build output
├── image/               # UI images and assets
├── public/              # Static public files
│
├── src/
│   │
│   ├── api/             # Axios API client & backend requests
│   ├── assets/          # Frontend assets
│   ├── auth/            # Authentication logic
│   ├── components/      # Reusable UI components
│   ├── extension/       # Extension communication logic
│   ├── pages/           # Main application pages
│   ├── styles/          # Global styles and CSS
│   ├── utils/           # Helper utilities
│   │
│   ├── App.tsx          # Main React application component
│   └── main.tsx         # Application entry point
│
├── Dockerfile           # Docker container configuration
├── eslint.config.js     # ESLint configuration
├── index.html           # Root HTML file
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
└── README.md
```

---

# Running the Frontend Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will run at:

```
http://localhost:5173
```

The frontend communicates with the **ChildSafeNet API backend**.

---

# Environment Configuration

Create a `.env` file in the project root:

```
VITE_API_BASE=https://localhost:7047
```

This variable defines the API base URL used for backend requests.

---

# Production Build

To create a production build:

```bash
npm run build
```

The optimized build will be generated in:

```
/dist
```

---

# Docker (Optional)

The frontend can also be built and served using Docker.

Example:

```bash
docker build -t childsafenet-frontend .
docker run -p 5173:80 childsafenet-frontend
```

---

# Integration with ChildSafeNet Platform

This frontend is one component of the full ChildSafeNet system.

The platform includes:

- **ASP.NET Core API** — backend service
- **FastAPI AI Service** — machine learning inference
- **Chrome Extension** — real-time browsing protection
- **Docusaurus Docs** — technical documentation

---

Built with ❤️ to create a safer internet experience for children.
