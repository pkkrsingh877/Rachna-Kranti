# Production Roadmap

---

## 1. Upgrade to Next.js 15.4 / 16 (Latest)

### Current: Next.js 15.3.1

| Area | Current | Target | Notes |
|---|---|---|---|
| Next.js | 15.3.1 | 15.4.x (stable) or 16 (canary) | `npm install next@latest` |
| React | 19.x | 19.x | Likely compatible, check peer deps |
| Turbopack | Dev only | Dev only | Already using — stable path |

### Upgrade Steps
1. `npm install next@latest react@latest react-dom@latest`
2. Check `next.config.ts` for deprecated keys (`output`, `experimental`, etc.)
3. Run `npm run build` — fix any type/API breakages
4. Pin versions once stable build passes
5. Review the [Next.js Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading)

### Why upgrade?
- Performance improvements in Turbopack and server components
- New image optimizations and caching defaults
- Better partial prerendering (PPR) support if needed later
- Longer LTS support window

---

## 2. Design System Overhaul

### Current State
- Tailwind CSS v4 with shadcn/ui (zinc theme, new-york style)
- Some SCSS files for Tiptap components
- CSS variables for dark/light mode
- No consistent design tokens beyond Tailwind defaults

### Target: Custom Brand Design System

#### Step 1 — Define Design Tokens in `globals.css`

```css
:root {
  /* Brand Colors — replace zinc scale */
  --color-brand-50: ...;
  --color-brand-100: ...;
  --color-brand-200: ...;
  --color-brand-300: ...;
  --color-brand-400: ...;
  --color-brand-500: ...;
  --color-brand-600: ...;
  --color-brand-700: ...;
  --color-brand-800: ...;
  --color-brand-900: ...;
  --color-brand-950: ...;

  /* Semantic tokens */
  --color-surface-primary: ...;
  --color-surface-secondary: ...;
  --color-text-primary: ...;
  --color-text-secondary: ...;
  --color-accent: ...;
  --color-border: ...;

  /* Typography scale */
  --font-display: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing / radius / shadow scales */
  --radius-sm: 0.375rem;
  --radius-md: 0.75rem;
  --radius-lg: 1.25rem;
}
```

#### Step 2 — Replace shadcn/ui with Custom Components

| shadcn/ui Component | Replacement Strategy |
|---|---|
| `button.tsx` | Custom `Button` with brand variants (primary, secondary, ghost, outline, danger) |
| `input.tsx` | Custom `Input` with floating label support |
| `form.tsx` | RHF + Zod with branded error styling |
| `navigation-menu.tsx` | Custom nav with animated underline or pill style |
| `select.tsx` | Custom select or headless-ui `Listbox` |
| `popover.tsx`, `calendar.tsx` | Keep as-is or replace with @radix-ui directly |
| `sonner.tsx` | Custom toast system matching brand |

#### Step 3 — Typography System
- Add a display serif font (e.g., Playfair Display, Fraunces) for headings
- Use Inter or Geist for body text (Geist already imported)
- Define a type scale: `text-xs` through `text-7xl` as semantic tokens
- Create prose styles for content display (reading experience)

#### Step 4 — Layout & Navigation
- Implement a sidebar + topbar layout for authenticated users (writer dashboard feel)
- Mobile: bottom tab bar instead of hamburger
- Add breadcrumb navigation

#### Step 5 — Component Audit
- Re-theme all Tiptap toolbar buttons to match brand
- Replace SCSS in Tiptap components with Tailwind classes or CSS modules
- Unify card/list component styles across hardcoded sections and API-fetched sections

---

## 3. Data Model Gaps & Fixes

### Current Models

**User**
```
name, email, image, provider, providerAccountId, username, role, bio
```
**Content** (discriminator: Poem / Prose / Story)
```
title, authorId, contentType, content (Mixed/JSON), tags, description
```

### Gaps & Recommended Additions

#### User Model Gaps

| Gap | Why Needed | Field to Add |
|---|---|---|
| No avatar URL field | `image` from OAuth may break; need fallback | `avatarUrl: String` + `avatarInitials: String` |
| No display name separate from username | Usernames should be unique slugs, names can be any | Keep `name`, ensure `username` is slugified + unique |
| No email verification | Users with OAuth only have email; direct auth users need verification | `emailVerified: Date` |
| No preferences | Theme, editor settings, notification prefs | `preferences: { theme, fontSize, autoSave }` |
| No content count / stats | Avoids N+1 queries for profile pages | `_contentCount: Number` (denormalized) |
| No timestamps for ban/suspension | Moderation | `suspendedAt: Date`, `suspensionReason: String` |
| No createdAt/updatedAt | Needed for all models | Already on via `timestamps: true` |

#### Content Model Gaps

| Gap | Why Needed | Field to Add |
|---|---|---|
| No `status` field | Draft vs published vs archived workflow | `status: enum ["draft", "published", "archived", "private"]` |
| No `slug` for URL | `/content/[id]` uses MongoDB `_id` — ugly URLs, bad SEO | `slug: String` (unique, URL-safe title) |
| No `publishedAt` | Need to know when content went live separately from creation | `publishedAt: Date` |
| No `isFeatured` / `isPinned` | For curated content on homepage | `isFeatured: Boolean`, `isPinned: Boolean` |
| No `readingTime` | Estimated read time for UI display | `readingTime: Number` (computed on save) |
| No `wordCount` | Analytics and display | `wordCount: Number` (computed on save) |
| No `coverImage` | Hero image for content cards | `coverImage: String (URL)` |
| No `excerpt` | Short preview for cards/search results | `excerpt: String (max 280 chars, auto-generated)` |
| No `likes` or engagement | Heart button exists in UI but no backend | `likesCount: Number`, `likedBy: [ObjectId]` (ref User) |
| No `comments` support | No discussion on content | New model `Comment` (see below) |
| No `version history` | Users lose content on edit with no undo | Use a separate `ContentVersion` model or keep full document copies |
| `content` field is `Mixed` | No validation; TypeScript provides none at runtime | Use Zod schema + Mongoose schema per content type |
| No `aiGenerated` flag | Can't distinguish AI vs human-written content | `aiGenerated: Boolean`, `aiModel: String` |
| `contentType` is an enum string | Needs to match frontend expectations; currently typed loosely | Strict enum type + Zod validation on write |

#### New Model: Comment

```typescript
{
  contentId: ObjectId (ref Content),
  authorId: ObjectId (ref User),
  body: String (required, max 5000),
  parentId: ObjectId (ref Comment, nullable — threaded replies),
  depth: Number (0 for top-level, max 2),
  likesCount: Number,
  editedAt: Date,
  timestamps: true
}
```

#### New Model: Collection / Reading List

```typescript
{
  name: String,
  description: String,
  authorId: ObjectId (ref User),
  contents: [{ contentId: ObjectId (ref Content), order: Number }],
  isPublic: Boolean,
  timestamps: true
}
```

#### New Model: Notification

```typescript
{
  userId: ObjectId (ref User),
  type: enum ["like", "comment", "follow", "system"],
  read: Boolean (default false),
  data: Mixed (e.g., { contentId, commentId }),
  timestamps: true
}
```

#### New Model: Follow

```typescript
{
  followerId: ObjectId (ref User),
  followingId: ObjectId (ref User),
  timestamps: true
}
// Compound unique index on (followerId, followingId)
```

---

## 4. Production Readiness — Full Checklist

### 4.1 Authentication & Security

- [ ] **Rotate all secrets**: Generate new `NEXTAUTH_SECRET`, new GitHub OAuth credentials, new Google Cloud project (OAuth + API key)
- [ ] **Add rate limiting**: Use Vercel WAF, Upstash Ratelimit, or middleware-based rate limiting on API routes (especially `/api/content/generate` to prevent abuse)
- [ ] **Add CSRF protection**: NextAuth includes built-in CSRF; verify it's enabled
- [ ] **Sanitize HTML content**: Content from AI and Tiptap editor could contain XSS — use DOMPurify server-side before storing
- [ ] **Validate JSON content field**: The `content: Mixed` field in Content model should have Zod validation per content type before DB write
- [ ] **Add request size limits**: Limit request body size on API routes (especially content submission and AI generation)
- [ ] **Remove `.env.local` from git**: It's currently tracked. Add to `.gitignore`, then `git rm --cached .env.local`, rotate all secrets

### 4.2 Database

- [ ] **Add database indexes**: Ensure indexes on `email`, `providerAccountId`, `username` (User), `authorId`, `contentType`, `slug` (Content), `createdAt` for sort queries
- [ ] **Add data validation at the database level**: Mongoose validation for required fields, enums, string length limits
- [ ] **Implement soft deletes**: Add `deletedAt: Date` to Content model instead of hard-deleting
- [ ] **Add connection pooling config**: MongoDB Atlas free tier has connection limits — configure `maxPoolSize` in `lib/db.ts`

### 4.3 API & Backend

- [ ] **Return consistent response envelopes**: Wrap all API responses in `{ success: boolean, data?: T, error?: string }`
- [ ] **Handle errors gracefully**: Every API route must have try/catch with meaningful error messages
- [ ] **Add request logging**: Use `pino` or `winston` for structured logging (Vercel Logs compatible)
- [ ] **Add health check endpoint**: `GET /api/health` → `{ status: "ok", db: "connected", timestamp }`
- [ ] **Add pagination**: `GET /api/content` currently returns all content — add `page`, `limit`, `cursor` parameters
- [ ] **Add sorting & filtering**: `?sort=recent|popular|trending` and `?type=poem|story`, `?tag=...`

### 4.4 Frontend

- [ ] **Add loading states**: Each page needs `loading.tsx` (App Router) for Suspense fallbacks
- [ ] **Add error boundaries**: Each page needs `error.tsx` for graceful error recovery
- [ ] **Add empty states**: Content list pages need "No content yet" / "Start writing" CTAs
- [ ] **Add 404 page**: `not-found.tsx` for unknown routes
- [ ] **Fix content saving**: Wire the Tiptap editor and poem form to actual API save endpoints (currently they only log to console)
- [ ] **Replace hardcoded data**: Featured poems/stories/dramas on homepage should come from the API (`isFeatured: true`)
- [ ] **Add meta tags / SEO**: Each page needs `generateMetadata()` with title, description, OG images
- [ ] **Add sitemap**: `app/sitemap.ts` for search engine indexing
- [ ] **Add robots.txt**: `app/robots.ts`
- [ ] **Implement progressive enhancement**: Editor should work without JS for basic content submission (noscript fallback)
- [ ] **Add PWA support**: Optional — manifest.json, service worker for offline reading

### 4.5 Performance

- [ ] **Enable ISR for content pages**: `/content/[id]` should use `generateStaticParams` + `revalidate` for caching
- [ ] **Add image optimization**: Use `next/image` everywhere, configure remote patterns in `next.config.ts`, add blur placeholders
- [ ] **Add CDN caching headers**: API routes should set `Cache-Control` headers for public/non-personalized data
- [ ] **Optimize bundle**: Run `next build --analyze` or use `@next/bundle-analyzer`, tree-shake Tiptap extensions
- [ ] **Add React Query caching**: Configure `staleTime` and `gcTime` for content queries to reduce API calls
- [ ] **Preconnect to external origins**: Add `<link rel="preconnect">` for Google Fonts, MongoDB Atlas IP range if static

### 4.6 Monitoring & Observability

- [ ] **Add Vercel Analytics**: Built-in — just flip the toggle in Vercel dashboard
- [ ] **Add Sentry**: `@sentry/nextjs` for error tracking. Free tier available.
- [ ] **Add custom logging**: Log API request duration, DB query performance, AI generation latency

### 4.7 Testing

- [ ] **Add unit tests**: Vitest + Testing Library for components and utilities
- [ ] **Add API route tests**: Vitest with route handler testing or Postman/Newman collection
- [ ] **Add E2E tests**: Playwright for critical flows (sign in, create content, view content, profile update)
- [ ] **Add MongoDB memory server for tests**: `mongodb-memory-server` for integration tests without a real Atlas connection

### 4.8 CI/CD & Deployment

- [ ] **Set up GitHub Actions**: Run `npm run lint`, `npm run typecheck`, `npm run test` on PR
- [ ] **Add Vercel Preview Deployments**: Auto-deploy each PR branch — already available via Vercel GitHub integration
- [ ] **Configure production domain**: Add custom domain in Vercel dashboard
- [ ] **Set environment variables in Vercel**: Add all `.env.local` values to Vercel Project Settings → Environment Variables
- [ ] **Remove `.env.local` from git** (critical security step before deploying)

---

## 5. Build vs Buy Decisions

| Capability | Build | Buy / Use |
|---|---|---|
| Auth | — | NextAuth (keep) |
| Database | — | MongoDB Atlas (keep, or migrate to Neon/PlanetScale for Vercel edge compatibility) |
| AI Content Gen | — | Google Gemini (keep, switch API key) |
| Rich Text Editor | — | Tiptap (keep — already deeply invested) |
| Comments | Build | — |
| Notifications | Build | — |
| Email | — | Resend / SendGrid (transactional) |
| Analytics | — | Vercel Analytics (free) + PostHog (self-host or free tier) |
| Rate Limiting | — | Upstash (Vercel-friendly) |
| File/Image Upload | — | Uploadthing / Cloudinary (free tiers) |
| Search | — | Algolia / Meilisearch if content scales |

---

## 6. Recommended Phases

### Phase 1 — Foundation (Week 1)
- Rotate all secrets, create new Google Cloud project
- Remove `.env.local` from git
- Add `status`, `slug`, `excerpt`, `publishedAt` to Content model
- Fix content saving from editor to API
- Add loading states, error boundaries, 404 page
- Add pagination to `/api/content`
- Set up Vercel project + environment variables

### Phase 2 — Design System & Auth (Week 2)
- Define brand design tokens
- Replace shadcn/ui with custom components
- Add sidebar + topbar layout
- Re-theme Tiptap toolbar
- Add user preferences model
- Add avatar handling with initials fallback

### Phase 3 — Community & Engagement (Week 3)
- Build Comment model + API + UI
- Build Like/Heart system (backend + frontend)
- Build Follow system
- Add Notification model + basic in-app notifications
- Filter homepage content from API instead of hardcoded data

### Phase 4 — Production Polish (Week 4)
- Rate limiting on all API routes
- Sentry error tracking
- DOMPurify HTML sanitization
- SEO: metadata, sitemap, robots.txt
- E2E tests with Playwright
- CI/CD pipeline with GitHub Actions
- Performance audit + ISR configuration
- Custom domain setup
