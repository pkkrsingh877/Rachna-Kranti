# Rachna Kranti — Project Summary

**Rachna Kranti** ("Creative Revolution") is a Next.js-based writing platform. Users sign in via email/password or OAuth (Google/GitHub), write using a rich Tiptap editor, generate AI-assisted content, publish poems/stories/dramas/prose, and engage with other writers via likes, comments, and follows.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 15.3.1 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + SCSS |
| UI Library | Custom Radix-based components + shadcn/ui, Lucide icons |
| Editor | Tiptap v2 (ProseMirror) with extensive custom extensions |
| Auth | NextAuth.js v4 — email/password (Credentials) + GitHub OAuth + Google OAuth |
| Database | MongoDB via Mongoose v8 (collection: `literaryWorks`) |
| AI | Google Gemini 2.0 Flash Lite (`@google/generative-ai`) |
| Forms | React Hook Form + Zod |
| Data Fetching | TanStack React Query v4 |
| Notifications | Sonner |
| Theming | next-themes + CSS variables (rose/teal/white, dark/light) |
| Email | Resend API (password resets) |

---

## Routes

| Path | Description |
|---|---|
| `/` | Home page — featured poems/stories/dramas from API |
| `/login` | Email/password + Google/GitHub OAuth sign-in |
| `/register` | Create account (name, email, password) |
| `/forgot-password` | Enter email to receive reset link |
| `/reset-password/[token]` | Set new password with reset token |
| `/poems` | Browse poems (API-driven) |
| `/stories` | Browse stories (API-driven) |
| `/dramas` | Browse dramas (API-driven) |
| `/content` | Browse all user-generated content (API, paginated) |
| `/content/write` | Create/edit content via Tiptap editor (supports `?id=` for edits) |
| `/content/[id]` | View single content (with likes, comments, follow author) |
| `/content/generate` | AI-assisted content generation |
| `/profile` | View user profile |
| `/profile/update` | Update profile (name, username, bio) |
| `/api/health` | Health check — reports all env var statuses |

---

## API Routes

| Endpoint | Methods | Description |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth authentication handler |
| `/api/auth/register` | POST | Create email/password account |
| `/api/auth/forgot-password` | POST | Send password reset email |
| `/api/auth/reset-password` | POST | Reset password with token |
| `/api/profile` | GET, PATCH | Fetch/update authenticated user's profile |
| `/api/content` | GET, POST | List (paginated, filtered, sorted) / create content |
| `/api/content/[id]` | GET, PATCH, DELETE | Read / partial update / delete (author or admin) |
| `/api/content/generate` | POST | Generate content via Google Gemini AI |
| `/api/content/[id]/comments` | GET, POST | List / add comments |
| `/api/content/[id]/comments/[commentId]` | DELETE | Delete comment |
| `/api/content/[id]/like` | GET, POST, DELETE | Check / add / remove like |
| `/api/users/[id]/follow` | GET, POST, DELETE | Check / add / remove follow |
| `/api/users/[id]/followers` | GET | List followers |
| `/api/users/[id]/following` | GET | List following |
| `/api/notifications` | GET | List notifications |
| `/api/notifications` | PATCH | Mark notification as read |
| `/api/notifications?unread=true` | GET | Unread notification count |
| `/api/admin/publish-as` | POST | Admin creates content under any user |
| `/api/health` | GET | Environment variable status check |

---

## Data Models (MongoDB/Mongoose)

- **User**: name, email, image, password (optional), provider, providerAccountId, username, role, bio, resetToken, resetTokenExpiry, preferences (theme, fontSize, autoSave)
- **Content** (discriminator base, collection `literaryWorks`): title, slug, authorId, contentType, content (JSON/Mixed), tags, description, excerpt, coverImage, status (draft/published/archived), publishedAt, aiGenerated, aiModel, likesCount, commentsCount, wordCount, readingTime
  - Discriminators: Poem, Prose, Story (same schema, differentiated by `contentType`)
- **Comment**: contentId, authorId, text, parentId (threaded replies)
- **Like**: contentId, userId (compound unique index)
- **Follow**: followerId, followingId (compound unique index)
- **Notification**: type (like/comment/follow/reply), recipientId, senderId, contentId, read

---

## Security & Architecture

- **Auth**: Sessions handled by NextAuth (JWT strategy). Credentials provider + OAuth.
- **Middleware**: Custom middleware — protects `/content/*`, `/profile/*`, `/api/content/*`. Public: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/api/auth/*`, `/api/health`.
- **Content ownership**: Only the author or an admin can PATCH/DELETE content. Delete cascades to comments, likes, notifications.
- **Validation**: Zod schemas validate all inputs. Content structure is validated per type (poemContentSchema, dramaContentSchema, etc.).
- **Admin**: Admin role required for `/api/admin/publish-as`. Moderation pipeline TBD.

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Yes | JWT encryption |
| `MONGODB_URI` | Yes | MongoDB Atlas connection |
| `GITHUB_CLIENT_ID` | Optional | GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth |
| `GEMINI_API_KEY` | Optional | Google Gemini AI (generation disabled if missing) |
| `RESEND_API_KEY` | Optional | Password reset emails (disabled if missing) |
| `EMAIL_FROM` | Optional | Sender address for reset emails |

---

## Known Gaps

1. **Drama discriminator**: `contentType: 'Drama'` is accepted by Zod/API but not in the Mongoose model interface — no discriminator model defined.
2. **Chapter/Book model**: No dedicated structure — novels are one giant `content` blob.
3. **Rate limiting**: Not implemented on API routes.
4. **Sentry**: Error tracking not set up.
5. **E2E tests**: No Playwright tests.
6. **CI/CD**: No GitHub Actions pipeline.
7. **Soft deletes**: Content is hard-deleted.
8. **SEO**: No sitemap or robots.txt.
