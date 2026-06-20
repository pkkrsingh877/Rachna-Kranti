# Progress Tracker

---

## Phase 1 — Foundation ✅

| # | Task | Status |
|---|---|---|
| 1.1 | Rotate all secrets, create new Google Cloud project | ❌ Not started — requires your action |
| 1.2 | Remove `.env.local` from git | ✅ Already gitignored |
| 1.3 | Add `status`, `slug`, `excerpt`, `publishedAt`, `coverImage`, `aiGenerated` to Content model | ✅ Done |
| 1.4 | Add Zod validation schemas for content types | ✅ Done |
| 1.5 | Fix content saving from editor to API | ✅ Done |
| 1.6 | Add pagination to `GET /api/content` (`page`, `limit`, `sort`, `type`, `status`, `author`) | ✅ Done |
| 1.7 | Create `POST /api/content` endpoint | ✅ Done |
| 1.8 | Wire `/content/write` Tiptap editor to save via API | ✅ Done |
| 1.9 | Wire `/poems/write` form to save via API | ✅ Done |
| 1.10 | Add `loading.tsx` for `/content`, `/content/[id]`, `/content/write`, `/profile`, `/profile/update` | ✅ Done |
| 1.11 | Add `error.tsx` for `/content`, `/content/[id]`, `/profile` | ✅ Done |
| 1.12 | Add `not-found.tsx` (global 404) | ✅ Done |
| 1.13 | Set up Vercel project + environment variables | ❌ Not started — requires your action |
| 1.14 | React Query setup: QueryClient, devtools, query key factory, custom hooks | ✅ Done |
| 1.15 | Update all pages to use React Query hooks; paginated API format | ✅ Done |

---

## Phase 2 — Design System & Auth ✅

| # | Task | Status |
|---|---|---|
| 2.1 | Define brand design tokens in `globals.css` (rose primary, teal secondary, white bg, black text) | ✅ Done |
| 2.2 | Create custom `Button` component replacing shadcn/ui | ✅ Done |
| 2.3 | Create custom `Input` / `Textarea` components | ✅ Done |
| 2.4 | Create sidebar + topbar layout (`AppLayout.tsx`) | ✅ Done |
| 2.5 | Add `User` preferences model (`theme`, `fontSize`, `autoSave`) | ✅ Done |
| 2.6 | Add `Avatar` component with initials fallback | ✅ Done |
| 2.7 | Replace old `Header` with new layout in root layout | ✅ Done |
| 2.8 | Re-theme Tiptap toolbar to match brand (SCSS overrides) | ✅ Done |

---

## Phase 3 — Community & Engagement ✅

| # | Task | Status |
|---|---|---|
| 3.1 | Build `Comment` model + API + `CommentSection` component | ✅ Done |
| 3.2 | Build `Like` model + API + `LikeButton` with optimistic updates | ✅ Done |
| 3.3 | Build `Follow` model + API + `FollowButton` | ✅ Done |
| 3.4 | Build `Notification` model + API + `NotificationBell` with unread badge (30s poll) | ✅ Done |
| 3.5 | Replace hardcoded homepage with API-driven `useContents()` | ✅ Done |

---

## Phase 4 — Auth & Content CRUD ✅

| # | Task | Status |
|---|---|---|
| 4.1 | Add email/password `CredentialsProvider` to NextAuth | ✅ Done |
| 4.2 | Create `/login` page with email/password + OAuth buttons | ✅ Done |
| 4.3 | Create `/register` page with sign-up form | ✅ Done |
| 4.4 | Add forgot-password / reset-password flow (Resend email) | ✅ Done |
| 4.5 | Add `PATCH /api/content/:id` — partial content updates | ✅ Done |
| 4.6 | Add `DELETE /api/content/:id` — cascade deletes comments, likes, notifications | ✅ Done |
| 4.7 | Wire edit mode in `/content/write` (`?id=` param, pre-fill, PATCH on submit) | ✅ Done |
| 4.8 | Add Edit/Delete buttons on `/content/[id]` (author only) | ✅ Done |
| 4.9 | Custom middleware — public path allowlist for auth pages | ✅ Done |

---

## Phase 5 — Resilience & Admin ✅

| # | Task | Status |
|---|---|---|
| 5.1 | Graceful env var degradation (AI, OAuth, Resend) | ✅ Done |
| 5.2 | Health check endpoint `GET /api/health` | ✅ Done |
| 5.3 | Replace mock data in `/poems`, `/stories`, `/dramas` with API queries | ✅ Done |
| 5.4 | Content-type–specific Zod validation (`superRefine`) | ✅ Done |
| 5.5 | Admin publish-as endpoint (`POST /api/admin/publish-as`) | ✅ Done |
| 5.6 | Remove `debug: true` from production auth config | ✅ Done |

---

## Phase 6 — Production Polish (Pending)

| # | Task | Status |
|---|---|---|
| 6.1 | Rate limiting on all API routes | ❌ Pending |
| 6.2 | Sentry error tracking | ❌ Pending |
| 6.3 | DOMPurify HTML sanitization | ❌ Pending |
| 6.4 | SEO: metadata, sitemap, robots.txt | ❌ Pending |
| 6.5 | E2E tests with Playwright | ❌ Pending |
| 6.6 | CI/CD pipeline with GitHub Actions | ❌ Pending |
| 6.7 | Performance audit + ISR configuration | ❌ Pending |
| 6.8 | Custom domain setup | ❌ Pending |
| 6.9 | Add `Drama` discriminator to Content model | ❌ Pending |
| 6.10 | Chapter/Book writing interface | ❌ Pending |

---

## Legend

- ✅ Done
- ❌ Pending / Not started
- (Requires your action) — needs you to do something in an external dashboard (Google Cloud, GitHub, Vercel, etc.)
