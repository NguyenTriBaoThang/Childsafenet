# Docker quickstart

## Run
```bash
copy .env.example .env
docker compose up -d --build
```

## Stop
```bash
docker compose down
```

## Use local SQL Server instead of container
- Remove `sql` service in compose (or ignore it)
- Set API connection string to your local server:
  `Server=YOURPC\\SQLEXPRESS;Database=ChildSafeNet_DB;Trusted_Connection=True;TrustServerCertificate=True;`
