# YouTube Analytics Dashboard

A shared creator analytics dashboard for comparing YouTube video performance across metrics and channels. Built with Next.js, Prisma, Supabase, and Google OAuth.

## Features

- **Google sign-in** — shared database so you and a collaborator see the same data
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

### 4. Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an OAuth 2.0 Client ID (Web application)
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-app.vercel.app/api/auth/callback/google` (add after deploying)
4. Copy Client ID and Secret into `.env`

### 5. Initialize database

```bash
npm run db:push
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

## Deploy to Vercel

### 1. Push to GitHub

Repo: [github.com/siebedg/youtube-analytics](https://github.com/siebedg/youtube-analytics)

### 2. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo
2. Add these environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Supabase **Transaction pooler** connection string (port 6543) |
| `DIRECT_URL` | Supabase **Direct** connection string (port 5432) |
| `AUTH_SECRET` | Random string (`openssl rand -base64 32`) |
| `AUTH_URL` | `https://your-app.vercel.app` |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |

3. Deploy

### 3. Sync database schema (first deploy only)

From your machine (with `.env` pointing at Supabase):

```bash
npm run db:push
```

Or run the same command in the Supabase SQL editor is not needed — `db:push` creates all tables.

### 4. Update Google OAuth

Add your Vercel URL to Google Cloud Console redirect URIs:

```
https://your-app.vercel.app/api/auth/callback/google
```

Both you and your friend sign in on the Vercel URL and share the same channels and videos.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Sync Prisma schema to Supabase |
| `npm run db:studio` | Open Prisma Studio |
