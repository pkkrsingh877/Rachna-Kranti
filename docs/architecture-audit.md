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

**Partially — gaps remain.**

### What the model supports:
- **Content type:** discriminator field (`Poem`, `Prose`, `Story` — but NOT `Drama` in the TS interface, even though Zod schemas and API validation support it)
- **Content field:** `Schema.Types.Mixed` — stores arbitrary JSON. The Zod schemas define expected shapes:
  - **Poem:** `[{ type: "stanza", lines: string[] }]`
  - **Story/Prose:** `[{ type: "paragraph", text: string }]`
  - **Drama:** `[{ type: "act", title, scenes: [...] }]`
- **Status:** `draft`, `published`, `archived`
- **Content-type–specific validation:** ✅ Applied via `superRefine` in `contentSchema`
- **Publish on behalf:** ✅ Available via `POST /api/admin/publish-as` (admin role)

### What's still missing:
- **No `Drama` discriminator model** — the model interface doesn't include `'Drama'`, and no discriminator model is defined for it. Creating content with `contentType: 'drama'` is permitted at the API/Zod level but Mongoose won't enforce a discriminator.
- **No `Chapter` / `Book` model** — novels and books are stored as generic `content: Mixed`. No dedicated model for chapters, books, or collections.

---

## 5. Tiptap editor — can it handle chapters/novels/books?

**It's a general rich text editor.** The current editor supports:
- Headings (H1-H4), bold, italic, underline, strikethrough, code
- Bullet lists, ordered lists, task lists
- Blockquotes, code blocks, horizontal rules
- Images, links, highlights (multicolor)
- Superscript, subscript

**It does NOT have:**
- Chapter navigation / outline panel
- Act/scene/character structured editing
- Book metadata (ISBN, publisher, copyright)
- Multi-document book management

The editor stores a single Tiptap JSON document in the `content` field. A "novel" would be one giant document. There's no mechanism to split a book into chapters within the editor.

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

### 6.5 Editor — Chapter/Novel/Book Writing Interface *(Future / Nice-to-have)*

- [ ] Create a "Book" content type with a `chapters: [{ title, content }]` structure
- [ ] Add a chapter navigation panel to the editor (sidebar with chapter list)
- [ ] Allow reordering, adding, deleting chapters
- [ ] Add book metadata fields (cover image, ISBN, publisher info, copyright notice)
- [ ] Create a `/books/write/[id]` page for book editing

### 6.6 Resilience — Graceful Degradation ✅

- [x] AI generate API checks `GEMINI_API_KEY` early and returns `503` with a clear message instead of crashing
- [x] Global `debug: true` removed — now `debug: process.env.NODE_ENV === 'development'`
- [x] Health check endpoint at `GET /api/health` — reports status of all env vars (database, nextauth, gemini, resend, OAuth)
- [x] Generate page shows descriptive toast error from API (`"AI generation is currently unavailable"`)
- [x] Auth config uses `?? ""` fallback for OAuth keys, so missing keys don't crash app startup

### 6.7 Mock Data Pages → API-Driven ✅

- [x] `/poems` — replaced hardcoded data with `useContents({ type: 'poem' })`, same card UI as homepage
- [x] `/stories` — replaced hardcoded data with `useContents({ type: 'story' })`
- [x] `/dramas` — replaced hardcoded data with `useContents({ type: 'drama' })`
- [x] All show loading spinner, empty state, author avatars, like/comment counts

### 6.8 JSON Schema Validation in API ✅

- [x] `content: z.any()` replaced with `superRefine` that validates content against type-specific schemas
- [x] `poemContentSchema`, `storyContentSchema`, `proseContentSchema`, `dramaContentSchema` applied based on `contentType`
- [x] Invalid content structure returns a `400` with detailed Zod error messages

### 6.9 "Publish on Behalf" / Admin Features ✅

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

## 8. Priority Order

### ✅ Done (must-do):
1. ✅ Email/password auth (Credentials provider) + login page + register page
2. ✅ Forgot password / reset password flow (Resend email)
3. ✅ Content update (`PATCH /api/content/:id`) + delete (`DELETE /api/content/:id`) with cascade
4. ✅ Edit mode in `/content/write` via `?id=` param

### ✅ Done (should-do):
5. ✅ Content-type–specific Zod validation in API (discriminated union via superRefine)
6. ❌ Still pending — Add `Drama` to Content model interface + discriminator
7. ✅ Replace mock data pages with API

### ✅ Done (nice-to-have):
8. ❌ Still pending — Chapter/Book writing interface
9. ✅ "Publish on behalf" admin feature (`POST /api/admin/publish-as`)
10. ✅ Graceful env var degradation / health check endpoint
