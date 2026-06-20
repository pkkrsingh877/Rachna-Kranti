# Architecture Audit & Requirements

---

## 1. Can users log in without Google/GitHub?

**No.** The app only has OAuth providers (Google + GitHub). There is:
- No email/password `Credentials` provider in `next-auth`
- No login page (`/login`)
- No sign-up/registration page
- No password reset / forgot password flow

If both Google and GitHub OAuth keys are dead/missing, **nobody can log in**.

---

## 2. What breaks when OAuth keys and AI key are missing?

| Scenario | Impact |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` missing | Google login button shows, but fails with error on click. Falls back to `""`, provider returns error at runtime. |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` missing | Same — GitHub login button shows but fails. |
| `GEMINI_API_KEY` missing | AI generation endpoint (`/api/content/generate`) returns 500. The rest of the app (read, write, edit) works fine. |
| `MONGODB_URI` missing | **App crashes on startup** — throws immediately in `lib/db.ts`. Must be set. |
| `NEXTAUTH_SECRET` missing | next-auth may fail to encrypt session tokens. |

**Verdict:** Without at least one working OAuth provider, the app is **completely locked**. The architecture does NOT fall apart otherwise — reading, writing, updating content all depend only on MongoDB being available and the user being authenticated.

---

## 3. Content CRUD — what exists vs what's missing

| Operation | Endpoint | Status |
|---|---|---|
| Create | `POST /api/content` | ✅ Works |
| Read (list) | `GET /api/content` | ✅ Works with pagination, filtering, sorting |
| Read (single) | `GET /api/content/:id` | ✅ Works |
| **Update** | `PUT /api/content/:id` or `PATCH /api/content/:id` | ❌ **Missing — content cannot be edited after creation** |
| **Delete** | `DELETE /api/content/:id` | ❌ **Missing — content cannot be deleted** |
| **Status transition** | None | ❌ Cannot publish/unpublish/archive |

**This means:** A user can write a poem or story, but once saved, they can never edit or delete it. This is a critical gap for a writing platform.

---

## 4. Content model — is it structured for dramas, novels, chapters, books?

**Partially.**

### What the model supports:
- **Content type:** discriminator field (`Poem`, `Prose`, `Story` — but NOT `Drama` in the TS interface, even though Zod schemas support it)
- **Content field:** `Schema.Types.Mixed` — stores arbitrary JSON. The Zod schemas define expected shapes:
  - **Poem:** `[{ type: "stanza", lines: string[] }]`
  - **Story/Prose:** `[{ type: "paragraph", text: string }]`
  - **Drama:** `[{ type: "act", title, scenes: [...] }]`
- **Status:** `draft`, `published`, `archived`

### What's missing:
- **No `Drama` discriminator model** — the model interface doesn't include `'Drama'`, and no discriminator model is defined for it.
- **No `Chapter` / `Book` model** — novels and books are stored as generic `content: Mixed`. There's no dedicated model for chapters, books, or collections.
- **No content-type–specific validation** — the API only validates with `z.any()` for content; the specific validators (`poemContentSchema`, etc.) exist but are never applied.
- **No "publish on behalf of"** — content is always authored by the authenticated user. No admin/mod impersonation, no co-author workflow.

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
- [ ] Apply content-type–specific Zod validation in the API route (`poemContentSchema`, `dramaContentSchema`, etc.)

### 6.5 Editor — Chapter/Novel/Book Writing Interface *(Future / Nice-to-have)*

- [ ] Create a "Book" content type with a `chapters: [{ title, content }]` structure
- [ ] Add a chapter navigation panel to the editor (sidebar with chapter list)
- [ ] Allow reordering, adding, deleting chapters
- [ ] Add book metadata fields (cover image, ISBN, publisher info, copyright notice)
- [ ] Create a `/books/write/[id]` page for book editing

### 6.6 Resilience — Graceful Degradation

- [ ] Wrap all API routes that depend on optional env vars with descriptive error messages
- [ ] On the AI generation page, show a clear "AI generation is currently unavailable" message instead of a generic 500
- [ ] On the login page, show both provider buttons but handle failures gracefully (e.g., "This sign-in method is currently unavailable")
- [ ] Add a health check endpoint or startup validation for required env vars
- [ ] Remove `debug: true` from next-auth config in production

### 6.7 Mock Data Pages → API-Driven

- [ ] Replace hardcoded data in `/poems`, `/stories`, `/dramas` with live API queries (same pattern as `app/page.tsx`)

### 6.8 JSON Schema Validation in API

- [ ] Replace `content: z.any()` in `contentSchema` with discriminated union based on `contentType`
- [ ] Apply `poemContentSchema` for poems, `dramaContentSchema` for dramas, etc.

### 6.9 "Publish on Behalf" / Admin Features *(Future)*

- [ ] Add a `role: "admin"` check on a publish-as-endpoint
- [ ] Create `POST /api/admin/publish-as` — admin creates content under another user's name
- [ ] Co-author / contributor model

---

## 7. Priority Order

### Must-do (blocking basic functionality):
1. Email/password auth (Credentials provider) + login page + register page
2. Forgot password / reset password flow
3. Content update (`PUT /api/content/:id`) + delete (`DELETE /api/content/:id`)
4. Wire edit mode in `/content/write` for existing content

### Should-do (completing Phase 3):
5. Content-type–specific Zod validation in API
6. Add `Drama` to Content model interface + discriminator
7. Replace mock data pages with API

### Nice-to-have:
8. Chapter/Book writing interface
9. "Publish on behalf" admin feature
10. Graceful env var degradation / user-facing error messages
