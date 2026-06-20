# You Need To Do

Items that require action outside this codebase (Google Cloud, GitHub, Vercel, etc.).

---

## 1. Set Up Email (Resend)

Password reset emails need a working Resend account.

1. Sign up at https://resend.com
2. Add your domain and verify it (or use the sandbox domain for testing)
3. Generate an API key
4. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxx
   EMAIL_FROM=Rachna Kranti <noreply@yourdomain.com>
   ```

---

## 2. Deploy to Vercel

1. Push repo to GitHub
2. Import project in Vercel dashboard
3. Add all env vars from `.env.local` to Vercel → Project Settings → Environment Variables
4. Deploy

---

## 3. Google Cloud Project (Optional — AI + Google OAuth)

Only needed if you want AI generation or Google login:

1. Create project at https://console.cloud.google.com
2. Enable Gemini API → generate API key → set as `GEMINI_API_KEY`
3. Configure OAuth consent screen → create OAuth 2.0 credentials (Web application)
4. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
5. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

---

## 4. Rotate Secrets (Before Production)

- Generate a new `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- Update GitHub OAuth credentials if needed
- Update all env vars in Vercel

---

## 5. GitHub OAuth (Optional)

If GitHub login is needed:
1. Go to https://github.com/settings/developers
2. Create/update OAuth App
3. Authorization callback URL: `https://yourdomain.com/api/auth/callback/github`
4. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

---

## Current Status

The app works with **just email/password + MongoDB**:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-secret>
MONGODB_URI=<your-mongodb-uri>
```

Everything else (Google OAuth, GitHub OAuth, Gemini AI, Resend email) is optional. Missing keys degrade gracefully — features just show an error message instead of crashing.
