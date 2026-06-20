# Progress Tracker

---

## Phase 1 — Foundation

| # | Task | Status |
|---|---|---|
| 1.1 | Rotate all secrets, create new Google Cloud project | ![ ] Not started — requires your action |
| 1.2 | Remove `.env.local` from git | ![x] Already gitignored |
| 1.3 | Add `status`, `slug`, `excerpt`, `publishedAt`, `coverImage`, `aiGenerated` to Content model | ![x] Done |
| 1.4 | Add Zod validation schemas for content types | ![x] Done |
| 1.5 | Fix content saving from editor to API | ![x] Done |
| 1.6 | Add pagination to `GET /api/content` (`page`, `limit`, `sort`, `type`, `status`, `author`) | ![x] Done |
| 1.7 | Create `POST /api/content` endpoint | ![x] Done |
| 1.8 | Wire `/content/write` Tiptap editor to save via API | ![x] Done |
| 1.9 | Wire `/poems/write` form to save via API | ![x] Done |
| 1.10 | Add `loading.tsx` for `/content`, `/content/[id]`, `/content/write`, `/profile`, `/profile/update` | ![x] Done |
| 1.11 | Add `error.tsx` for `/content`, `/content/[id]`, `/profile` | ![x] Done |
| 1.12 | Add `not-found.tsx` (global 404) | ![x] Done |
| 1.13 | Set up Vercel project + environment variables | ![ ] Not started — requires your action |
| 1.14 | React Query setup: QueryClient, devtools, query key factory (`lib/query-keys.ts`), custom hooks (`use-content.ts`, `use-profile.ts`) | ![x] Done |
| 1.15 | Update all pages to use React Query hooks; paginated API format `{ count, previous, next, results }` | ![x] Done |

---

## Phase 2 — Design System & Auth

| # | Task | Status |
|---|---|---|
| 2.1 | Define brand design tokens in `globals.css` (rose primary, teal secondary, white bg, black text) | ![x] Done |
| 2.2 | Create custom `Button` component replacing shadcn/ui | ![x] Done |
| 2.3 | Create custom `Input` / `Textarea` components | ![x] Done |
| 2.4 | Create sidebar + topbar layout (`AppLayout.tsx`) | ![x] Done |
| 2.5 | Add `User` preferences model (`theme`, `fontSize`, `autoSave`) | ![x] Done |
| 2.6 | Add `Avatar` component with initials fallback | ![x] Done |
| 2.7 | Replace old `Header` with new layout in root layout | ![x] Done |
| 2.8 | Re-theme Tiptap toolbar to match brand (SCSS overrides) | ![x] Done |

---

## Phase 3 — Community & Engagement

| # | Task | Status |
|---|---|---|
| 3.1 | Build `Comment` model + API (`GET/POST /api/content/:id/comments`, `DELETE /api/content/:id/comments/:commentId`) + `CommentSection` component with reply support | ![x] Done |
| 3.2 | Build `Like` model + API (`GET/POST/DELETE /api/content/:id/like`) + `LikeButton` component with optimistic updates | ![x] Done |
| 3.3 | Build `Follow` model + API (`GET/POST/DELETE /api/users/:id/follow`, `GET /api/users/:id/followers`, `GET /api/users/:id/following`) + `FollowButton` component | ![x] Done |
| 3.4 | Build `Notification` model + API (`GET /api/notifications`, `PATCH /api/notifications` mark read) + `NotificationBell` component with unread badge | ![x] Done |
| 3.5 | Replace hardcoded `Poems`/`Stories`/`Dramas` homepage components with API-driven `useContents()` queries | ![x] Done |

---

## Phase 4 — Production Polish

| # | Task | Status |
|---|---|---|
| 4.1 | Rate limiting on all API routes | ![ ] Pending |
| 4.2 | Sentry error tracking | ![ ] Pending |
| 4.3 | DOMPurify HTML sanitization | ![ ] Pending |
| 4.4 | SEO: metadata, sitemap, robots.txt | ![ ] Pending |
| 4.5 | E2E tests with Playwright | ![ ] Pending |
| 4.6 | CI/CD pipeline with GitHub Actions | ![ ] Pending |
| 4.7 | Performance audit + ISR configuration | ![ ] Pending |
| 4.8 | Custom domain setup | ![ ] Pending |

---

## Legend

- ![x] Done
- ![ ] Pending / Not started
- (Requires your action) — needs you to do something in an external dashboard (Google Cloud, GitHub, Vercel, etc.)
