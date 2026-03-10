# ChildSafeNet Documentation Site (Docusaurus)

This directory contains the **official documentation website** for the ChildSafeNet project.

The site is built using **Docusaurus**, a modern static documentation framework developed by Meta.

It provides detailed technical documentation including:

- System architecture
- API reference
- Browser extension design
- AI training pipeline
- Deployment and CI/CD
- Security and privacy considerations.

The documentation is published via **GitHub Pages**.

---

# Tech Stack

- **Docusaurus 3**
- **React**
- **MDX**
- **GitHub Pages** (deployment)

---

# Project Structure

```txt
docs-site/
│
├── docs/                    # Documentation pages (.md / .mdx)
├── src/                     # Custom React components & styles
├── static/                  # Static assets (images, diagrams)
├── docusaurus.config.js     # Site configuration
├── sidebars.js              # Documentation sidebar structure
└── package.json
```

---

# Running Locally

Start the development server:

```bash
cd docs-site
npm install
npm run start
```

The documentation site will be available at:

```txt
http://localhost:3000
```

Hot reload is enabled, so changes in .md or .mdx files will update automatically.

---

# Build Static Site

Generate the production build:

```bash
npm run build
```

The compiled static site will be generated in:

```txt
/build
```

This output is used for deployment.

---

# Deployment (GitHub Pages)

The documentation site is deployed automatically via **GitHub Pages**.

## Requirements

- GitHub Pages source branch: `gh-pages`
- Repository configured for GitHub Pages deployment

## Manual Deploy

```bash
npm run deploy
```

This command will:

1. Build the documentation site
2. Push the static build to the `gh-pages` branch
3. Publish the site automatically

---

# Live Documentation

The published documentation is available at:

```txt
https://nguyentribaothang.github.io/Childsafenet
```

---

# Related Project

Main project repository:

**ChildSafeNet — AI-powered Internet Safety Platform**

Components include:

- ASP.NET Core API

- React Dashboard

- FastAPI AI Service

- Chrome Extension

- Docusaurus Documentation

---

Built with ❤️ for safer internet experiences for children.
