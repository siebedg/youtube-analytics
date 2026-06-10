# YouTube Analytics Dashboard

A shared creator analytics dashboard for comparing YouTube video performance across metrics and channels. Built with Next.js, Prisma, and Supabase.

## Features

- **Simple sign-in** — shared username/password, same database for you and a collaborator
- **Multiple channels** — tab between channels, rename them, add new ones
- **Channel comparison** — compare average metrics between two channels
- **Edit videos** — update existing video data anytime
- **Custom metrics** — add or remove metrics per channel
- **Dark theme** — dark by default with a light/dark toggle

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project
2. Open **Project Settings → Database → Connection string**
3. Copy the **Transaction pooler** URI → `DATABASE_URL` (port 6543)
4. Copy the **Direct connection** URI → `DIRECT_URL` (port 5432)

### 3. Configure environment

Copy `.env.example` to `.env` and fill in all values.

### 4. Initialize database

```bash
npm run db:push
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your `AUTH_USERNAME` / `AUTH_PASSWORD`.

## Deploy to Vercel

1. Import the GitHub repo on [vercel.com/new](https://vercel.com/new)
2. Add these environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Supabase **Transaction pooler** (port 6543) |
| `DIRECT_URL` | Supabase **Direct** connection (port 5432) |
| `AUTH_SECRET` | Random string (`openssl rand -base64 32`) |
| `AUTH_USERNAME` | Shared login username |
| `AUTH_PASSWORD` | Shared login password |

3. Deploy — no OAuth redirect URIs or Google setup needed.

Both you and your collaborator use the same username/password and share the same channels and videos.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Sync Prisma schema to Supabase |
| `npm run db:studio` | Open Prisma Studio |
