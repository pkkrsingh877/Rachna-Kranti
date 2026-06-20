# Architecture Audit & Requirements

---

## 1. Can users log in without Google/GitHub? ✅

**Yes.** The app now supports email/password login via a `CredentialsProvider` in `next-auth`:
- `/login` page with email/password form (plus Google/GitHub OAuth buttons)
- `/register` page with sign-up form (name, email, password, bcrypt hashing)
- `/forgot-password` page — enters email, receives reset link
- `/reset-password/[token]` page — sets new password
- `POST /api/auth/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`
- `password`, `resetToken`, `resetTokenExpiry` fields on `User` model (optional for OAuth users)
- Password reset emails via Resend API (free on Vercel, 100 emails/day)

Both credentials and OAuth providers work in parallel. Users can also link their email account to OAuth by signing in with the same email via Google/GitHub.

---

## 2. What breaks when OAuth keys and AI key are missing?

| Scenario | Impact |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` missing | Google login button shows, but fails with error on click. Falls back to `""`, provider returns error at runtime. |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` missing | Same — GitHub login button shows but fails. |
| `GEMINI_API_KEY` missing | AI generation endpoint (`/api/content/generate`) returns `503` with `"AI generation is currently unavailable"`. Rest of app works fine. |
| `MONGODB_URI` missing | **App crashes on startup** — throws immediately in `lib/db.ts`. Must be set. |
| `NEXTAUTH_SECRET` missing | next-auth may fail to encrypt session tokens. |

**Verdict:** The app now works with email/password alone — OAuth providers are optional. Reading, writing, updating content all depend only on MongoDB being available and the user being authenticated.

---

## 3. Content CRUD — what exists vs what's missing ✅

| Operation | Endpoint | Status |
|---|---|---|
| Create | `POST /api/content` | ✅ Works |
| Read (list) | `GET /api/content` | ✅ Works with pagination, filtering, sorting |
| Read (single) | `GET /api/content/:id` | ✅ Works |
| **Update** | `PATCH /api/content/:id` | ✅ Partial update (title, content, tags, description, excerpt, coverImage, status). Author/admin guard. |
| **Delete** | `DELETE /api/content/:id` | ✅ Cascade deletes comments, likes, notifications. Author/admin guard. |
| **Status transition** | Via `PATCH` | ✅ Publish/unpublish/archive by setting `status` field. `publishedAt` set automatically. |

Edit/delete buttons appear on `/content/[id]` for the author. The `/content/write` page accepts `?id=` to load existing content into the form + editor and switches to `PATCH` on submit.

---

## 4. Content model — is it structured for dramas, novels, chapters, books? ✅

**Partially — Poetry, Stories, and Prose are well-served. Books and Dramas need dedicated modules.**

### Current approach: Generic Content model
The existing `Content` discriminator model (Poem, Prose, Story) works well for short-form writing. However, forcing Books/Novels and Dramas into this single model creates problems:
- No chapter/scene separation — a novel is one giant `content` blob
- No per-chapter word counts or reading progress
- No act/scene/character structure for dramas
- Generic editor doesn't know about chapters

### Proposed architecture (from `docs/more.md`):
Keep Poems, Stories, and Prose in the existing Content system. Build dedicated **Book** and **Drama** modules with their own models, APIs, editors, and readers.

```
Current:                     Proposed:
Content                      Poetry Module
 ├─ Poem                     Story Module
 ├─ Story                    Book Module     ← NEW
 ├─ Prose                    Drama Module    ← NEW
 └─ Drama  (partial)
```

**Shared infrastructure** (reused across all modules):
- Auth & permissions
- Comments, likes, follows, notifications
- Rich text editor (Tiptap component)
- Tags, cover images, search
- Publishing engine
- Export engine (PDF, EPUB)

**Dedicated per module** (different UX):
- Editor layout (chapter sidebar vs act/scene tree vs simple text area)
- Reading experience (table of contents, scene navigation, progress)
- CRUD APIs and pages

### Feasibility check — ✅ Current architecture supports this:
- Modular Mongoose models — just add new model files (same pattern as `models/User.ts`)
- Folder-based API routes — add `app/api/books/*`, `app/api/dramas/*`
- Page directories — add `app/books/*`, `app/dramas/*`
- Reusable components already exist (SimpleEditor, LikeButton, CommentSection, etc.)
- No breaking changes — existing Content model stays untouched
- All additive — no refactoring needed

---

## 5. Tiptap editor — can it handle chapters/novels/books? ✅

**The editor component itself is the shared infrastructure. The UX around it differs per module.**

### What the existing editor supports (shared):
- Headings (H1-H4), bold, italic, underline, strikethrough, code
- Bullet lists, ordered lists, task lists
- Blockquotes, code blocks, horizontal rules
- Images, links, highlights (multicolor)
- Superscript, subscript

### How it maps to the new architecture:

| Module | Editor UX | Content Source |
|---|---|---|
| Poems / Stories / Prose | Simple full-page editor (current) | Single `content` field |
| Books | Chapter sidebar + editor (one chapter at a time) | `Chapter.content` per chapter |
| Dramas | Act/Scene tree + editor (one scene at a time) | `Scene.content` per scene |

The Tiptap editor component (`SimpleEditor.tsx`) is reused everywhere — only the surrounding UI (navigation, metadata, structure) changes per module. This is exactly the "share infrastructure, not workflows" principle.

---

## 6. New Requirements

Based on the audit, here's what needs to be built:

### 6.1 Email/Password Authentication ✅

- [x] Add `CredentialsProvider` to `next-auth` in `lib/auth.ts`
- [x] Create `/login` page with email/password form
- [x] Create `/register` page with sign-up form (name, email, password)
- [x] Add password hashing with `bcryptjs`
- [x] Add `password` field to `User` model (optional — null for OAuth users)
- [x] Handle mixed auth: let users log in via email/password OR Google/GitHub
- [x] Show appropriate error messages when OAuth providers fail

### 6.2 Forgot Password / Reset Password ✅

- [x] Create `POST /api/auth/forgot-password` — accepts email, generates reset token, sends email (Resend)
- [x] Create `POST /api/auth/reset-password` — accepts token + new password
- [x] Add `resetToken` and `resetTokenExpiry` fields to `User` model
- [x] Create `/forgot-password` page
- [x] Create `/reset-password/[token]` page
- [x] Set up an email service using Resend API (free on Vercel, 100 emails/day)
- [x] Env vars needed: `RESEND_API_KEY`, `EMAIL_FROM`

### 6.3 Content CRUD — Add Update & Delete ✅

- [x] Add `PATCH /api/content/:id` — update title, content, tags, description, coverImage, status (partial)
- [x] Add `DELETE /api/content/:id` — delete content and cascade clean up (comments, likes, notifications)
- [x] Wire the `/content/write` page for editing existing content (`?id=` param, pre-fill form, PATCH vs POST)
- [x] Add edit/delete buttons on the content detail page (`/content/[id]`) — shown only to author

### 6.4 Content Model — Add Drama Support

- [ ] Update `IBaseWork.contentType` to include `'Drama'`
- [ ] Add `Drama` discriminator model
- [x] Content-type–specific Zod validation in API route (`poemContentSchema`, `dramaContentSchema`, etc.) ✅ done in 6.8

### 6.5 Book Module *(New — dedicated module)*

- [ ] Create `Book` model (`title`, `slug`, `authorId`, `type: Novel | Novella | Biography | Autobiography | Memoir | Anthology | Research | General`, `subtitle?`, `description`, `coverImage`, `tags`, `status`, `chapterCount`, bio-specific metadata: `subjectPerson?`, `birthDate?`, `deathDate?`, `timelineEnabled?`)
- [ ] Create `Chapter` model (`bookId`, `title`, `order`, `content`, `wordCount`)
- [ ] Create API routes: `POST /api/books`, `GET /api/books`, `GET /api/books/:id`, `PATCH /api/books/:id`, `DELETE /api/books/:id`
- [ ] Create chapter API routes: `POST /api/books/:id/chapters`, `PATCH /api/books/:id/chapters/:chapterId`, `DELETE /api/books/:id/chapters/:chapterId`, `PATCH /api/books/:id/chapters/reorder`
- [ ] Build Book Editor page (`/books/create`, `/books/[id]/edit`) with chapter sidebar, one-chapter-at-a-time editing
- [ ] Add chapter CRUD: create, delete, duplicate, reorder (drag-and-drop)
- [ ] Book-level publish workflow — chapters are never published individually; publishing the book creates a frozen version
- [ ] Versioning system: maintain a draft version separate from the published version (like Medium/Notion/Git — edit creates a draft, publish creates a new version)
- [ ] Book metadata form: title, subtitle, description, cover, type selector; for biographies add subjectPerson, birthDate, deathDate, timelineEnabled
- [ ] Build Book Reader page (`/books/[slug]`) with table of contents, chapter navigation, reading progress
- [ ] Add comments, likes, and sharing per book

### 6.6 Drama Module *(New — dedicated module)*

- [ ] Create `Drama` model (`title`, `slug`, `authorId`, `type: Drama | Play | Screenplay | Stage Script | TV Script`, `description`, `coverImage`, `status`, `actsCount`, `scenesCount`)
- [ ] Create `Act` model (`dramaId`, `title`, `order`)
- [ ] Create `Scene` model (`dramaId`, `actId`, `title`, `order`, `content`, `wordCount`)
- [ ] Create API routes: `POST /api/dramas`, `GET /api/dramas`, `GET /api/dramas/:id`, `PATCH /api/dramas/:id`, `DELETE /api/dramas/:id`
- [ ] Create act/scene API routes: nested CRUD under `/api/dramas/:id/acts/:actId/scenes/:sceneId`
- [ ] Build Drama Editor page (`/dramas/create`, `/dramas/[id]/edit`) with act/scene tree, one-scene-at-a-time editing
- [ ] Add act/scene CRUD: create, delete, duplicate, reorder acts and scenes
- [ ] Structured dialogue storage: `{ speaker: "Hamlet", text: "To be or not to be" }` instead of raw text
- [ ] Build Drama Reader page (`/dramas/[slug]`) with act/scene navigation, jump-to-scene, script formatting

### 6.7 Reader Experience *(New — per-module reading UI)*

- [ ] Book reader: cover page, table of contents, chapter-by-chapter navigation, previous/next chapter, reading progress bar, bookmarking
- [ ] Biography reader: same layout as Book reader, plus optional timeline, important events, people mentioned, places mentioned (future enhancement)
- [ ] Drama reader: act/scene tree sidebar, jump directly to any scene, script-format rendering
- [ ] Shared reading features: adjustable font size, dark mode, reading time estimate, continue-reading

### 6.8 Shared Publishing Engine *(New — cross-module)*

- [ ] Unified status lifecycle: `draft → review → scheduled → published → archived`
- [ ] Validation rules per module on publish (e.g., book needs title + description + cover + at least one chapter)
- [ ] **Book-level publish — chapters are never published individually.** Publishing the book freezes a version; edits create a new draft version while the published version stays live
- [ ] Versioning system: maintain `Published Version` and `Draft Version` per book (inspired by Medium, Notion, Git — never edit the published book directly)
- [ ] Auto-save every 30 seconds with draft version tracking
- [ ] Publish locks metadata version
- [ ] Publishing status display in UI per module

### 6.9 Export System *(New — cross-module)*

- [ ] **Reader PDF** — for reading: cover, TOC, chapters
- [ ] **Print PDF** — for Amazon KDP / IngramSpark: ISBN placeholder, front matter, copyright page, headers, footers, margins, page numbers
- [ ] **Manuscript PDF** — for publisher submissions: double-spaced, Courier/Times, submission format
- [ ] EPUB export (future): for Kindle and ebook readers
- [ ] Export all four modules: Book, Drama, Poem, Story
- [ ] Export button in reader UI and editor UI

### 6.10 Resilience — Graceful Degradation ✅

- [x] AI generate API checks `GEMINI_API_KEY` early and returns `503` with a clear message instead of crashing
- [x] Global `debug: true` removed — now `debug: process.env.NODE_ENV === 'development'`
- [x] Health check endpoint at `GET /api/health` — reports status of all env vars (database, nextauth, gemini, resend, OAuth)
- [x] Generate page shows descriptive toast error from API (`"AI generation is currently unavailable"`)
- [x] Auth config uses `?? ""` fallback for OAuth keys, so missing keys don't crash app startup

### 6.11 Mock Data Pages → API-Driven ✅

- [x] `/poems` — replaced hardcoded data with `useContents({ type: 'poem' })`, same card UI as homepage
- [x] `/stories` — replaced hardcoded data with `useContents({ type: 'story' })`
- [x] `/dramas` — replaced hardcoded data with `useContents({ type: 'drama' })`
- [x] All show loading spinner, empty state, author avatars, like/comment counts

### 6.12 JSON Schema Validation in API ✅

- [x] `content: z.any()` replaced with `superRefine` that validates content against type-specific schemas
- [x] `poemContentSchema`, `storyContentSchema`, `proseContentSchema`, `dramaContentSchema` applied based on `contentType`
- [x] Invalid content structure returns a `400` with detailed Zod error messages

### 6.13 "Publish on Behalf" / Admin Features ✅

- [x] `POST /api/admin/publish-as` creates content under any user's name (requires admin role)
- [x] Accepts `authorId` + standard content fields (title, contentType, content, etc.)
- [x] Validates with `contentSchema` including type-specific content validation
- [x] For non-admin users, returns `403 Forbidden`

---

---

## 7. DB Design — Models Overview

### User (`models/User.ts`)

```typescript
{
  name: String (required),
  email: String (required, unique),
  image: String,                          // OAuth avatar URL
  password: String,                       // bcrypt hash (credentials users only)
  provider: String,                       // 'google' | 'github' | undefined (for OAuth)
  providerAccountId: String,              // OAuth account ID
  username: String (unique, sparse),
  role: 'user' | 'moderator' | 'admin',
  bio: String,
  resetToken: String,                     // password reset
  resetTokenExpiry: Date,
  preferences: {
    theme: 'light' | 'dark' | 'system',
    fontSize: 'sm' | 'base' | 'lg',
    autoSave: Boolean,
  },
  timestamps: true,
}
```

### Content (`models/Content.ts`) — collection: `literaryWorks`

Discriminator base — `contentType` determines the shape:

```typescript
{
  title: String (required, indexed),
  slug: String (indexed),                 // auto-generated from title on save
  authorId: ObjectId (ref User, indexed),
  contentType: 'Poem' | 'Prose' | 'Story', // Missing: 'Drama' in model interface (Zod/API accept it)
  content: Mixed (JSON),                  // per-type schemas:
  //   Poem:    [{ type: "stanza", lines: string[] }]
  //   Prose:   [{ type: "paragraph", text: string }]
  //   Story:   [{ type: "paragraph", text: string }]
  //   Drama:   [{ type: "act", title, scenes: [...] }]
  tags: [String],
  description: String,
  excerpt: String (max 280),
  coverImage: String (URL),
  status: 'draft' | 'published' | 'archived' (indexed),
  publishedAt: Date,
  aiGenerated: Boolean,
  aiModel: String,
  likesCount: Number,
  commentsCount: Number,
  wordCount: Number,                       // auto-computed on save
  readingTime: Number,                     // auto-computed on save (ceil(wordCount/200))
  timestamps: true,
}
```

**Discriminators:** `Poem`, `Prose`, `Story` — same schema, differentiated by `contentType`.

### Comment (`models/Comment.ts`)

```typescript
{
  contentId: ObjectId (ref Content, indexed),
  authorId: ObjectId (ref User, indexed),
  text: String (required, max 2000),
  parentId: ObjectId (ref Comment),       // null = top-level; non-null = reply
  timestamps: true,
}
```

**Index:** `{ contentId: 1, createdAt: -1 }`

### Like (`models/Like.ts`)

```typescript
{
  contentId: ObjectId (ref Content, indexed),
  userId: ObjectId (ref User, indexed),
  createdAt: Date,
}
```

**Index:** `{ contentId: 1, userId: 1 }` (unique compound — one like per user per content)

### Follow (`models/Follow.ts`)

```typescript
{
  followerId: ObjectId (ref User, indexed),
  followingId: ObjectId (ref User, indexed),
  createdAt: Date,
}
```

**Index:** `{ followerId: 1, followingId: 1 }` (unique compound)

### Notification (`models/Notification.ts`)

```typescript
{
  type: 'like' | 'comment' | 'follow' | 'reply',
  recipientId: ObjectId (ref User, indexed),
  senderId: ObjectId (ref User, indexed),
  contentId: ObjectId (ref Content),
  read: Boolean (default: false),
  timestamps: true,
}
```

**Index:** `{ recipientId: 1, createdAt: -1 }`, `{ recipientId: 1, read: 1 }`

---

### Book Module Models *(Proposed)*

#### Book (`models/Book.ts`)

```typescript
{
  title: String (required),
  slug: String (unique, indexed),           // auto-generated from title
  authorId: ObjectId (ref User, indexed),
  type: 'Novel' | 'Novella' | 'Biography' | 'Autobiography' | 'Memoir' | 'Anthology' | 'Research' | 'General',
  subtitle: String,
  description: String,
  coverImage: String (URL),
  tags: [String],
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived',
  chapterCount: Number,                     // denormalized, updated on chapter CRUD
  subjectPerson: String,                    // for biography/autobiography
  birthDate: Date,
  deathDate: Date,
  timelineEnabled: Boolean,
  publishedVersion: Number,                 // current published version ID
  draftVersion: Number,                     // current draft version ID
  publishedAt: Date,
  timestamps: true,
}
```

#### Chapter (`models/Chapter.ts`)

```typescript
{
  bookId: ObjectId (ref Book, indexed),
  title: String (required),
  order: Number,                            // position in book
  content: Mixed (JSON),                    // Tiptap JSON — same format as Content.content
  wordCount: Number,                        // auto-computed on save
  version: Number,                          // which version this chapter belongs to (0 = current draft)
  timestamps: true,
}
```

**Index:** `{ bookId: 1, order: 1 }` (compound — sort chapters by order within a book)

#### Relationship:
```
Book (draft — version 0)
 ├─ Chapter 1 (order: 1)
 ├─ Chapter 2 (order: 2)
 └─ Chapter 3 (order: 3)

Book (published — version 1, frozen)
 ├─ Chapter 1 (order: 1)
 ├─ Chapter 2 (order: 2)
 └─ Chapter 3 (order: 3)

Edit → new draft (version 0) created; published version (version 1) stays live.
Publish draft → freeze as version 2; readers see version 2.
```

---

### Drama Module Models *(Proposed)*

#### Drama (`models/Drama.ts`)

```typescript
{
  title: String (required),
  slug: String (unique, indexed),
  authorId: ObjectId (ref User, indexed),
  type: 'Drama' | 'Play' | 'Screenplay' | 'Stage Script' | 'TV Script',
  description: String,
  coverImage: String (URL),
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived',
  actsCount: Number,                        // denormalized
  scenesCount: Number,                      // denormalized
  timestamps: true,
}
```

#### Act (`models/Act.ts`)

```typescript
{
  dramaId: ObjectId (ref Drama, indexed),
  title: String (required),
  order: Number,
}
```

**Index:** `{ dramaId: 1, order: 1 }`

#### Scene (`models/Scene.ts`)

```typescript
{
  dramaId: ObjectId (ref Drama, indexed),
  actId: ObjectId (ref Act, indexed),
  title: String (required),
  order: Number,
  content: Mixed (JSON),                    // Tiptap JSON — supports structured dialogue:
  //   { speaker: "Hamlet", text: "To be or not to be" }
  //   { type: "paragraph", text: "Stage direction" }
  wordCount: Number,                        // auto-computed
}
```

**Index:** `{ actId: 1, order: 1 }`

#### Relationship:
```
Drama
 ├─ Act I (order: 1)
 │   ├─ Scene 1 (order: 1)
 │   ├─ Scene 2 (order: 2)
 │   └─ Scene 3 (order: 3)
 │
 └─ Act II (order: 2)
     ├─ Scene 1 (order: 1)
     └─ Scene 2 (order: 2)
```

---

## 8. Priority Order

### ✅ Done (must-do):
1. ✅ Email/password auth (Credentials provider) + login page + register page
2. ✅ Forgot password / reset password flow (Resend email)
3. ✅ Content update (`PATCH /api/content/:id`) + delete (`DELETE /api/content/:id`) with cascade
4. ✅ Edit mode in `/content/write` via `?id=` param

### ✅ Done (should-do):
5. ✅ Content-type–specific Zod validation in API (discriminated union via superRefine)
6. ✅ Replace mock data pages with API

### ✅ Done (nice-to-have):
7. ✅ "Publish on behalf" admin feature (`POST /api/admin/publish-as`)
8. ✅ Graceful env var degradation / health check endpoint

### 🔲 Phase A — Book Module (next)
- `Book` + `Chapter` models
- Book CRUD API routes
- Chapter CRUD API within a book
- Book Editor page with chapter sidebar (one chapter at a time)
- Book Reader page with TOC + chapter navigation
- Comments/likes/bookmarks on books

### 🔲 Phase B — Drama Module
- `Drama` + `Act` + `Scene` models
- Drama CRUD API routes
- Act/Scene CRUD API within a drama
- Drama Editor page with act/scene tree (one scene at a time)
- Drama Reader page with act/scene navigation
- Structured dialogue storage (`{ speaker, text }`)

### 🔲 Phase C — Publishing & Export
- Shared publishing engine (draft → review → scheduled → published → archived)
- Validation rules per module
- Auto-save with draft version tracking
- PDF export with cover, TOC, page numbers
- Print-ready PDF for Amazon KDP / IngramSpark
- EPUB export (future)

### 🔲 Phase D — Production Polish
- Rate limiting on all API routes
- Sentry error tracking
- SEO: metadata, sitemap, robots.txt
- E2E tests with Playwright
- CI/CD pipeline with GitHub Actions
