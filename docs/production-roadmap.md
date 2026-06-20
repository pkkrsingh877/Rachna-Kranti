# Production Roadmap

---

## Completed Milestones

### Auth & User Management
- Email/password registration & login (`CredentialsProvider`)
- Google & GitHub OAuth (optional — works alongside credentials)
- Forgot password / reset password via Resend email
- User profile with preferences (theme, fontSize, autoSave)
- Avatar with initials fallback
- Custom middleware (public auth pages, protected content routes)
- Mixed auth: OAuth users can link email accounts

### Content System
- Create content via `POST /api/content` (Tiptap editor)
- Read content — paginated list (`GET /api/content`) + single (`GET /api/content/:id`)
- Update content — partial `PATCH /api/content/:id` (author/admin)
- Delete content — `DELETE /api/content/:id` with cascade cleanup
- Status transitions (draft → published → archived)
- Zod validation per content type (poem, story, prose, drama)
- Read/Update/Delete buttons on content detail page
- Edit mode in `/content/write` via `?id=` param
- `POST /api/admin/publish-as` — admin creates content under any user

### Design System
- Brand tokens: rose primary, teal secondary, white background, near-black text
- Custom Button, Input, Textarea components
- Sidebar + topbar layout (`AppLayout.tsx`)
- Tiptap editor fully re-themed (SCSS + CSS vars)
- Dark/light mode with next-themes

### Community & Engagement
- Comments: create, list, threaded replies, delete
- Likes: toggle with optimistic UI updates
- Follows: follow/unfollow, followers/following lists
- Notifications: list, mark read, unread count badge (30s poll)

### API & Data Fetching
- React Query with `staleTime: 2min`, `retry: 1`, devtools
- Query key factory pattern
- Paginated API responses `{ count, previous, next, results }`
- Separate hooks per feature (`use-content`, `use-comments`, `use-likes`, `use-follows`, `use-notifications`)
- Health check endpoint `GET /api/health`
- Graceful degradation when env vars are missing (AI, OAuth, Resend)

---

## Remaining Work

### 1. Content Model Gaps

| Gap | Priority | Effort |
|---|---|---|
| Add `'Drama'` to Content model interface + discriminator | Medium | Small |
| Chapter/Book model with scenes, acts, character management | Low | Large |
| Content version history (undo on edit) | Low | Medium |
| Soft deletes (`deletedAt` field) | Low | Small |

### 2. Production Readiness Checklist

#### 2.1 Security
- [ ] **Rotate all secrets**: New `NEXTAUTH_SECRET`, new GitHub OAuth creds, new Google Cloud project
- [ ] **Rate limiting**: Use Upstash Ratelimit or Vercel WAF on API routes (especially `/api/content/generate`)
- [ ] **DOMPurify**: Sanitize HTML from Tiptap editor before storing (XSS prevention)
- [ ] **Request size limits**: Limit body on content submission and AI generation endpoints

#### 2.2 Database
- [ ] **Add missing indexes**: Compound indexes on `(authorId, createdAt)`, `(contentType, status, createdAt)`
- [ ] **Configure `maxPoolSize`** in MongoDB connection for Atlas free tier limits

#### 2.3 API & Backend
- [ ] **Consistent error envelopes**: Wrap all responses in `{ success, data?, error? }`
- [ ] **Structured logging**: Use pino or winston for Vercel Logs compatibility
- [ ] **`Cache-Control` headers**: On public content read endpoints

#### 2.4 Frontend
- [ ] **SEO**: `generateMetadata()` per page, sitemap, robots.txt
- [ ] **`<Image>` component**: Replace `<img>` in Avatar and content with `next/image`
- [ ] **PWA**: manifest.json, service worker for offline reading (optional)

#### 2.5 Monitoring
- [ ] **Sentry**: `@sentry/nextjs` for error tracking (free tier)
- [ ] **Vercel Analytics**: Enable in dashboard

#### 2.6 Testing
- [ ] **Unit tests**: Vitest + Testing Library for components
- [ ] **API tests**: Route handler testing or Postman collection
- [ ] **E2E tests**: Playwright for critical flows (login, register, create content, edit content)
- [ ] **MongoDB memory server**: `mongodb-memory-server` for integration tests

#### 2.7 CI/CD & Deployment
- [ ] **GitHub Actions**: Lint, typecheck, test on PR
- [ ] **Vercel project**: Set up environment variables in dashboard
- [ ] **Custom domain**: Configure in Vercel
- [ ] **Remove `.env.local` from git**: Already gitignored — verify before deploy

---

## Recommended Next Phases

### Phase A — Deploy & Stabilize (1-2 days)
1. Create a new Google Cloud project (if AI is needed) — or deploy without it (email/password auth + manual content creation already work)
2. Set up Vercel project + environment variables
3. Configure custom domain
4. Add Sentry error tracking
5. Enable rate limiting

### Phase B — Content Model Completion (1-2 days)
6. Add `Drama` discriminator to Content model
7. Add soft deletes to Content model
8. Add database indexes

### Phase C — Quality (2-3 days)
9. Add unit tests + API tests
10. Add E2E tests with Playwright
11. Set up GitHub Actions CI/CD
12. SEO: metadata, sitemap, robots.txt

### Phase D — Advanced Features (optional)
13. Chapter/Book writing interface
14. Content version history
15. PWA support
