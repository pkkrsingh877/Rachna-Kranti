# Rachna Kranti — Project Summary

**Rachna Kranti** ("Creative Revolution") is a Next.js-based writing platform that uses AI (Google Gemini) to help users create poems, stories, dramas, and prose. Users sign in via GitHub or Google OAuth, write using a rich Tiptap editor, generate AI-assisted content, and manage their profile.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 15.3.1 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + SCSS |
| UI Library | shadcn/ui (Radix primitives), Lucide icons |
| Editor | Tiptap v2 (ProseMirror) with extensive custom extensions |
| Auth | NextAuth.js v4 (GitHub + Google OAuth) |
| Database | MongoDB via Mongoose v8 |
| AI | Google Gemini 2.0 Flash Lite (`@google/generative-ai`) |
| Forms | React Hook Form + Zod |
| Data Fetching | TanStack React Query v4 |
| Notifications | Sonner |
| Theming | next-themes + CSS variables (dark/light) |

---

## Routes

| Path | Description |
|---|---|
| `/` | Home page (hardcoded featured poems, stories, dramas) |
| `/stories` | Hardcoded story listing |
| `/poems` | Hardcoded poem listing |
| `/poems/write` | Simple Zod-validated poem form (logs to console only) |
| `/dramas` | Hardcoded drama listing |
| `/content` | Browse user-generated content (fetched from API via React Query) |
| `/content/write` | Full Tiptap rich text editor (logs to console only) |
| `/content/[id]` | View single content by ID |
| `/profile` | View user profile |
| `/profile/update` | Update profile (name, username, bio) |

## API Routes

| Endpoint | Methods | Description |
|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth authentication handler |
| `/api/profile` | GET, PATCH | Fetch/update authenticated user's profile |
| `/api/content` | GET | List all content (sorted by createdAt desc) |
| `/api/content/[id]` | GET | Get single content by MongoDB ObjectId |
| `/api/content/generate` | POST | Generate content via Google Gemini AI and save to DB |

---

## Current State & Known Issues

### Authentication
- NextAuth is configured with **GitHub OAuth** and **Google OAuth** providers.
- The middleware (`middleware.ts`) protects **all routes** — no pages are public.
- GitHub OAuth is functional.
- **Google OAuth is broken** — the Google Cloud project credentials (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`) were deleted from Google Cloud Console and have not been recreated.

### AI Content Generation
- The `/api/content/generate` endpoint uses Google Gemini (`gemini-2.0-flash-lite-001`) via the `@google/generative-ai` SDK.
- The `GEMINI_API_KEY` in `.env.local` was also deleted from Google Cloud.
- **AI generation will not work** until a new Google Cloud project is created and a fresh API key is generated.

### Content Saving
- Both `/poems/write` and `/content/write` forms log content to console and show a toast — **they do not save to the database**.
- The only endpoint that persists content to MongoDB is the AI generation endpoint (`/api/content/generate`).

### Data Inconsistency
- The home page and `/poems`, `/stories`, `/dramas` routes use **hardcoded placeholder data**.
- The `/content/*` routes use **API-fetched data from MongoDB**.
- This creates two parallel content display systems with no overlap.

### Database
- `.env.local` has `MONGODB_URI` pointing to database `fragnifique`.
- `lib/db.ts` overrides with `dbName: "test_rachna_kranti"`.
- The MongoDB connection string includes live credentials.

### Environment Variables

| Variable | Status | Purpose |
|---|---|---|
| `NEXTAUTH_URL` | Set | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Set | JWT encryption |
| `GITHUB_CLIENT_ID` | Set | GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | Set | GitHub OAuth |
| `GOOGLE_CLIENT_ID` | Set but **invalid** | Google OAuth (deleted from Google Cloud) |
| `GOOGLE_CLIENT_SECRET` | Set but **invalid** | Google OAuth (deleted from Google Cloud) |
| `MONGODB_URI` | Set | MongoDB Atlas connection |
| `GEMINI_API_KEY` | Set but **invalid** | Google Gemini AI (deleted from Google Cloud) |

---

## Editor (Tiptap)

The project has a deeply customized Tiptap editor with:
- StarterKit (headings, paragraphs, lists, blockquotes, code blocks, HR)
- Text alignment (left, center, right, justify)
- Bold, italic, strike, code, underline
- Highlight (multicolor), superscript, subscript
- Task lists
- Image embedding & upload (with progress tracking)
- Links (custom enhanced extension)
- Selection decorations
- Trailing node enforcement
- Dark/light theme toggle
- 37 custom SVG icon components
- 24 toolbar UI components
- 5 custom nodes with SCSS styling
- 3 custom extensions

---

## Data Models (MongoDB/Mongoose)

- **User**: name, email, image, provider, username, role, bio
- **Content** (discriminator base, collection `literaryWorks`): title, authorId, contentType, content (JSON), tags, description
  - Discriminators: Poem, Prose, Story (same schema, differentiated by `contentType`)
- **Prompt**: title, prompt, content reference

---

## Getting Started

```bash
# Install dependencies
npm install

# You need a valid .env.local with working credentials.
# At minimum, GitHub OAuth + MongoDB need to work for basic functionality.
# Google OAuth and Gemini require a new Google Cloud project.

# Run development server
npm run dev
```

### To restore Google integrations:
1. Create a new project at https://console.cloud.google.com
2. Enable the **Gemini API** and generate an API key → set as `GEMINI_API_KEY`
3. Configure the **OAuth consent screen** and create OAuth 2.0 credentials → set as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
4. Add `http://localhost:3000` as an authorized redirect URI
