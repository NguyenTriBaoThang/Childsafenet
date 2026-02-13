# Demo Script (Presenter Notes)

## Setup (before demo)
- Start API + AI + SQL (docker compose or local)
- Load Extension unpacked
- Create 2 accounts: admin + parent (or seed)

## Live demo
1) Home page: giới thiệu, nhấn Login
2) Parent login -> Settings:
   - Child age: 10
   - Mode: Balanced
   - Block Adult/Gambling/Phishing ON
   - Whitelist: google.com, wikipedia.org
3) Dashboard:
   - Pair extension -> READY
   - Open test URL: example adult site -> bị block
4) Logs: thấy record mới (BLOCK)
5) Admin:
   - Admin Dataset: thấy URL Pending
   - Approve -> Trigger train job
   - Train job chạy background (show status)
