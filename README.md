# YouTube Analytics

Open `/zenex` or `/jojoh` — each URL has its own channels and videos in the same Supabase database.

## Vercel env vars

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Supabase pooler (6543) |
| `DIRECT_URL` | Supabase direct (5432) |

No auth, no login, no Google.

## Local

```bash
npm install
cp .env.example .env
npm run db:push
npm run dev
```

→ http://localhost:3000/zenex
