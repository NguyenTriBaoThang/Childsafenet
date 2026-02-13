# BRANCHING.md — ChildSafeNet Branching Rules

> Mục tiêu: dễ làm việc nhóm, dễ review, dễ release.

## 1) Nhánh chính

- **`main`**: nhánh *stable* (luôn build/CI xanh).  
  - Chỉ nhận merge từ PR đã review.
  - Mỗi lần release/tag thì merge vào `main`.

- **`develop`** *(khuyến nghị)*: nhánh tích hợp trước khi lên `main`.  
  - Dev hằng ngày merge vào `develop`.
  - Khi ổn thì tạo PR `develop -> main`.

> Nếu team nhỏ: có thể bỏ `develop` và làm trực tiếp theo PR vào `main` (nhưng vẫn phải dùng branch prefix bên dưới).

---

## 2) Quy tắc đặt tên nhánh

**Format chuẩn (khuyên dùng):**
```
<prefix>/<ticket-or-date>-<short-slug>
```

**Prefix dùng trong dự án:**
- `feature/`  — tính năng mới  
- `fix/`      — sửa bug  
- `hotfix/`   — sửa gấp trên production  
- `chore/`    — việc “lặt vặt” không đổi hành vi (configs, tooling, refactor nhỏ)  
- `docs/`     — tài liệu  
- `refactor/` — refactor lớn  
- `test/`     — thêm/sửa test  
- `ci/`       — CI/CD, workflows

**Ví dụ:**
- `feature/CSN-12-settings-ui`
- `fix/CSN-19-login-role-bug`
- `chore/2026-02-14-update-eslint`
- `docs/CSN-01-readme-final`
- `ci/CSN-30-github-actions-build`

---

## 3) Quy tắc làm việc + PR

### 3.1 Tạo nhánh
- Từ `develop` (hoặc `main` nếu không dùng develop).
- Không commit trực tiếp lên `main`.

### 3.2 PR bắt buộc có
- Mô tả rõ *What/Why/How*.
- Link Issue/Ticket (nếu có).
- Checklist test tối thiểu (build ok, chạy app ok).

### 3.3 Merge strategy
- Khuyến nghị **Squash & Merge** để lịch sử sạch.
- Hoặc **Rebase** nếu team quen.

### 3.4 Quy tắc review
- Ít nhất 1 reviewer (team nhỏ) / 2 reviewer (team lớn).
- CI phải xanh trước khi merge.

---

## 4) Quy tắc commit message (Conventional Commits)

**Format:**
```
<type>(scope): <subject>
```

**Types chuẩn:**
- `feat`: thêm tính năng
- `fix`: sửa bug
- `docs`: tài liệu
- `style`: format, không đổi logic
- `refactor`: refactor code
- `test`: test
- `chore`: tooling, configs, deps
- `ci`: workflow, pipeline
- `perf`: tối ưu hiệu năng
- `build`: build system

**Ví dụ hợp lệ:**
- `feat(settings): add whitelist & blacklist UI`
- `fix(auth): handle role in login response`
- `chore(ci): update node version in workflow`

---

## 5) Release tags (gợi ý)

- Dùng tag dạng: `vMAJOR.MINOR.PATCH`
- Ví dụ: `v1.0.0`, `v1.1.0`

---

## 6) Khi nào dùng "chore"?

Dùng **`chore`** khi:
- Update dependencies / eslint / prettier / tsconfig
- Thêm script build, chỉnh workflow
- Refactor nhỏ không đổi behavior
- Dọn file, đổi tên folder, chỉnh config

Không dùng `chore` cho:
- Thêm tính năng (dùng `feat`)
- Sửa bug (dùng `fix`)
