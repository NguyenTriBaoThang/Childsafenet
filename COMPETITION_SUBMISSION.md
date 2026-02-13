# ChildSafeNet — Competition Submission Pack (HUTECH CNTT 2025)

## 1) One-liner
ChildSafeNet là hệ thống AI + Chrome Extension giúp phụ huynh giám sát và cảnh báo rủi ro Internet cho trẻ em (phishing, adult, gambling, malicious).

## 2) Demo flow (3 phút)
1. Đăng nhập Parent trên Web
2. Vào Settings bật Block Adult/Gambling/Phishing + allowlist domain an toàn
3. Pair Extension -> bật Extension
4. Mở URL test (adult/gambling/phishing)
5. Xem bị Block + log được ghi vào Dashboard
6. Admin vào Admin Dataset -> duyệt -> trigger train (Option B)

## 3) Tech stack
- AI service: FastAPI + scikit-learn (hybrid RF + pipeline)
- API: ASP.NET Core 8 + EF Core + SQL Server
- Frontend: React + TypeScript
- Extension: MV3 (background/service worker + content script + block page)

## 4) What makes it “AI”
- Model phân loại URL theo risk category
- Pipeline train định kỳ từ dataset nội bộ (Approved URLs)
- Drift monitor (CI) để cảnh báo lệch phân phối

## 5) Running locally
Xem `docker-compose.yml` hoặc hướng dẫn README.
