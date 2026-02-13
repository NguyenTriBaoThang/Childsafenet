# Security Policy

<p align="justify">
ChildSafeNet is a academic project (Web + API + Chrome Extension) for protecting children on the Internet.
We take security seriously and appreciate responsible disclosure.
</p>

---

## Supported Versions

<p align="justify">
This project is under active development. We recommend reporting vulnerabilities against the latest version on the default branch.
</p>

- **Supported:** `main` / latest commit
- **Not supported:** old branches, forks, or outdated builds

---

## Reporting Security Issues

<p align="justify">
If you believe you have found a security vulnerability in ChildSafeNet, please report it privately.
</p>

<p align="justify">

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

</p>

<p align="justify">
Instead, contact the maintainers using one of the following:
</p>

- **Email:** `nguyentribaothang@gmail.com`  
- **Or:** GitHub **Private Vulnerability Reporting** (if enabled on the repository)

---

## What to Include in Your Report

<p align="justify">
Please include as much of the information below as possible to help us reproduce and fix the issue quickly:
</p>

- Type of issue (e.g., auth bypass, IDOR, SQL injection, XSS, RCE, SSRF, CSRF, token leakage)
- Affected component(s):
  - **Frontend (React/TS)**
  - **Backend API (ASP.NET Core / SQL Server)**
  - **AI service (FastAPI)**
  - **Chrome Extension (MV3)**
- Full paths of the related source file(s)
- Location of affected code (branch/commit/tag or direct URL)
- Required configuration / environment
- Step-by-step reproduction instructions
- Proof-of-concept (PoC) or exploit code (if possible)
- Impact assessment (what an attacker can achieve)

---

## In-Scope Examples

<p align="justify">
We are especially interested in issues that impact user safety, privacy, and data integrity, such as:
</p>

- Authentication/authorization bypass (admin/parent role separation)
- JWT/session handling issues (token reuse, leakage, insecure storage)
- SQL injection / unsafe query handling
- Sensitive data exposure (logs, dataset export, user info)
- Extension messaging abuse (web ↔ extension pair, postMessage spoofing)
- Insecure CORS / insecure headers
- Unsafe file export/download endpoints
- Supply chain vulnerabilities (malicious dependencies)

---

## Out of Scope

<p align="justify">
The following are generally out of scope:
</p>

- Social engineering, phishing attempts, or physical attacks
- DoS / DDoS attacks or stress testing without permission
- Issues in third-party services/libraries without a practical exploit in this project
- Vulnerabilities in forks or modified deployments not maintained by this repo
- Reports that only describe missing security headers without real impact

---

## Coordinated Disclosure Timeline

<p align="justify">
We aim to respond quickly:
</p>

- **Acknowledgement:** within **3–7 days**
- **Triage & reproduction:** as soon as possible
- **Fix & release:** depends on severity and complexity

<p align="justify">
Please avoid public disclosure until a fix is available or an agreement is made with the maintainers.
</p>

---

## Safe Harbor

<p align="justify">
We support good-faith security research. We will not pursue legal action against researchers who:
</p>

- Make a good-faith effort to avoid privacy violations and data destruction
- Only access data necessary to demonstrate the vulnerability
- Report the issue privately and allow reasonable time to fix it

<p align="justify">
If you are unsure whether your research is allowed, please contact us first.
</p>

---

## Security Contact

<p align="justify">
Primary contact:
</p>

- Email: `nguyentribaothang@gmail.com` 
- Maintainer: `NguyenTriBaoThang`, `ttrung03`, `KienTrungZir`

---

<p align="justify">
Thank you for helping keep ChildSafeNet safer.
</p>
