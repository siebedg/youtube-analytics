# YouTube Analytics Dashboard

YouTube video performance dashboard. Each passkey gets its own channels and data.

## Login

Two passkeys: **zenex** and **jojoh** — click the button or type the word on `/login`.

## Local setup

```bash
npm install
cp .env.example .env
# Set AUTH_SECRET, DATABASE_URL, DIRECT_URL
npm run db:push
npm run dev
```

## Deploy to Vercel

| Variable | Value |
|----------|-------|
| `AUTH_SECRET` | Random string |
| `DATABASE_URL` | Supabase pooler (6543) |
| `DIRECT_URL` | Supabase direct (5432) |

No Google, no Supabase Auth, no email signup.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run db:push` | Sync schema |
