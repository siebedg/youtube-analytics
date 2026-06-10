# YouTube Analytics Dashboard

A creator analytics dashboard for comparing YouTube video performance. Each user has their own account and data via Supabase Auth.

## Features

- **Supabase accounts** — sign up with email/password, your own channels and videos
- **Multiple channels** — tab between channels, rename them, add new ones
- **Channel comparison** — compare average metrics between two channels
- **Edit videos** — update existing video data anytime
- **Custom metrics** — add or remove metrics per channel
- **Dark theme** — dark by default with a light/dark toggle

## Supabase setup (one time)

1. Create a project at [supabase.com](https://supabase.com)
2. **Authentication → Providers → Email** — leave enabled
3. For easy signup without email confirmation: disable **Confirm email**
4. **Authentication → URL Configuration** — add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-app.vercel.app/auth/callback`
5. **Project Settings → API** — copy `URL` and `anon` key
6. **Project Settings → Database** — copy connection strings for Prisma

## Local setup

```bash
npm install
cp .env.example .env
# fill in all env vars
npm run db:push
npm run dev
```

Open [http://localhost:3000/signup](http://localhost:3000/signup) to create an account.

If you had old data without user accounts, reset the schema:

```bash
npx prisma db push --force-reset
```

## Deploy to Vercel

Add these environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `DATABASE_URL` | Supabase transaction pooler (6543) |
| `DIRECT_URL` | Supabase direct connection (5432) |

No Google OAuth. Add your Vercel URL to Supabase redirect URLs (see above).

Your friend creates their own account at `/signup` — they only see their own data.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Sync Prisma schema to Supabase |
| `npm run db:studio` | Open Prisma Studio |
