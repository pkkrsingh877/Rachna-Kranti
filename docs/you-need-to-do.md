# You Need To Do — Manual Steps

Items that require your accounts, dashboards, or physical actions. Nothing here can be coded.

---

## 1. Google Cloud — Create New Project

Google OAuth and Gemini API are both broken (previous project deleted).

### Steps
1. Go to https://console.cloud.google.com → **Create Project** → name it (e.g. "Rachna Kranti")
2. **Enable APIs**: Search for and enable both:
   - **Gemini API** (for AI content generation)
   - **Google OAuth API** (for sign-in)
3. **Create OAuth 2.0 Credentials**:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` and `https://<your-vercel-domain>/api/auth/callback/google`
   - Copy **Client ID** → set as `GOOGLE_CLIENT_ID` in Vercel
   - Copy **Client Secret** → set as `GOOGLE_CLIENT_SECRET` in Vercel
4. **Create API Key** (for Gemini):
   - APIs & Services → Credentials → **Create Credentials** → API Key
   - Restrict the key to **Gemini API** only
   - Copy → set as `GEMINI_API_KEY` in Vercel

---

## 2. GitHub OAuth — Verify / Recreate

Current `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` may still work. If not:

1. Go to https://github.com/settings/developers → **New OAuth App**
2. Homepage URL: `http://localhost:3000` and `https://<your-vercel-domain>`
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github` and `https://<your-vercel-domain>/api/auth/callback/github`
4. Copy **Client ID** → set as `GITHUB_CLIENT_ID` in Vercel
5. Copy **Client Secret** → set as `GITHUB_CLIENT_SECRET` in Vercel

---

## 3. MongoDB Atlas — Verify Connection

1. Go to https://cloud.mongodb.com → your cluster
2. **Network Access** → Add `0.0.0.0/0` (allow all) or Vercel's IP ranges
3. **Database Access** → Check the user credentials still work
4. If you changed the password, update `MONGODB_URI` in Vercel

---

## 4. Vercel — Deploy

1. Go to https://vercel.com → **Add New Project**
2. Import this GitHub repository
3. **Environment Variables** — set all of these:
   ```
   NEXTAUTH_URL=<your-vercel-domain>
   NEXTAUTH_SECRET=<run: openssl rand -base64 32>
   GITHUB_CLIENT_ID=<from step 2>
   GITHUB_CLIENT_SECRET=<from step 2>
   GOOGLE_CLIENT_ID=<from step 1>
   GOOGLE_CLIENT_SECRET=<from step 1>
   MONGODB_URI=<from step 3>
   GEMINI_API_KEY=<from step 1>
   ```
4. **Generate a new NEXTAUTH_SECRET** — run `openssl rand -base64 32` locally and paste it
5. Deploy

### Post-Deploy
- Add your custom domain in Vercel → Domains
- Update OAuth redirect URIs in Google Cloud and GitHub to include the production domain
- Test sign-in with both GitHub and Google
- Test content creation and AI generation

---

## 5. Local `.env.local`

Your current `.env.local` has the old (broken) Google keys. You have two options:

### Option A — Start fresh
Delete the file entirely, then create a new one:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<same as Vercel>
GITHUB_CLIENT_ID=<same as Vercel>
GITHUB_CLIENT_SECRET=<same as Vercel>
GOOGLE_CLIENT_ID=<same as Vercel>
GOOGLE_CLIENT_SECRET=<same as Vercel>
MONGODB_URI=<same as Vercel>
GEMINI_API_KEY=<same as Vercel>
```

### Option B — Keep GitHub + MongoDB only (skip Google OAuth + Gemini)
You only need these to run locally:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<anything>
GITHUB_CLIENT_ID=<your github id>
GITHUB_CLIENT_SECRET=<your github secret>
MONGODB_URI=<your mongo uri>
```

---

## 6. Optional Nice-To-Haves

| Task | Service | Cost |
|---|---|---|
| Set up Sentry for error tracking | sentry.io | Free tier |
| Set up Vercel Analytics | Vercel dashboard | Free |
| Add custom domain | Namecheap / Cloudflare | ~$10/yr |
| Set up transactional email (welcome, notifications) | Resend / SendGrid | Free tier |
| Add image upload (for editor) | Uploadthing / Cloudinary | Free tier |
