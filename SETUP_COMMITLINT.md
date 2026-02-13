# Setup commitlint + Husky (Frontend)

Chạy trong thư mục frontend (nơi có `package.json`):

```bash
npm i -D @commitlint/cli @commitlint/config-conventional husky
npx husky init
```

Tạo file `commitlint.config.cjs`.

Tạo hook:

```bash
npx husky add .husky/commit-msg "npx --no -- commitlint --edit \$1"
```

> Nếu dùng pnpm:
```bash
pnpm add -D @commitlint/cli @commitlint/config-conventional husky
pnpm dlx husky init
pnpm dlx husky add .husky/commit-msg "pnpm dlx commitlint --edit \$1"
```
