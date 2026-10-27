# Indira Gandhi Co-operative Hospital: website

The Next.js (App Router, TypeScript) site for **https://igchkochi.com**. It's a pixel-faithful conversion of the original static page, which is kept untouched in `legacy/` as the visual-regression baseline.

See **[MIGRATION_NOTES.md](./MIGRATION_NOTES.md)** for the audit, decisions, deviations, the editable-content map and verification results.

## Requirements

- Node.js ≥ 20.9 (developed on 22)
- pnpm 12 (`corepack enable pnpm` picks up the version pinned in `package.json`)

## Setup

```bash
pnpm install
cp .env.example .env.local     # fill in the values below
pnpm dev                       # http://localhost:3000
```

Without `MONGODB_URI` the site runs on the bundled seed data (`content/seed`) and `/admin` shows a setup message. To work on the admin locally:

```bash
pnpm db:dev                    # local MongoDB on :27017 (no Docker needed), keep it running
# in .env.local: MONGODB_URI=mongodb://127.0.0.1:27017/igch, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
pnpm seed                      # loads the seed data and creates the first admin
pnpm dev                       # sign in at http://localhost:3000/admin
```

| Script                                         | What it does                                                                        |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| `pnpm dev`                                     | Dev server (Turbopack)                                                              |
| `pnpm build` / `pnpm start`                    | Production build / serve                                                            |
| `pnpm seed`                                    | Seeds MongoDB: fills **empty** collections, creates the first admin. Safe to re-run |
| `pnpm seed --reset`                            | Replaces all content collections with the seed data (users are kept)                |
| `pnpm db:dev`                                  | Local MongoDB with data in `.data/mongo`                                            |
| `pnpm lint` / `pnpm typecheck` / `pnpm format` | ESLint, `tsc --noEmit`, Prettier                                                    |
| `pnpm legacy`                                  | Serves the original site from `legacy/` on :4100                                    |
| `pnpm test`                                    | Site tests without a database (needs `pnpm build` first)                            |
| `pnpm test:admin`                              | Admin end-to-end tests: throwaway MongoDB, seed, build and run (≈1 min)             |
| `pnpm test:visual` / `pnpm test:interactions`  | Parity with the original / behaviour, a11y, SEO, content and seed-data checks       |

First-time Playwright setup: `pnpm exec playwright install chromium`.

## Environment variables

| Name                                            | Required           | Purpose                                                                                                                |
| ----------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`                                   | yes (prod)         | MongoDB connection string, e.g. Atlas `mongodb+srv://…/igch`. Without it the site uses `content/seed`.                 |
| `SESSION_SECRET`                                | yes (prod)         | Signs the admin login cookie. At least 32 characters (`openssl rand -hex 32`).                                         |
| `CLOUDINARY_URL`                                | yes (prod uploads) | `cloudinary://key:secret@cloud` from the Cloudinary dashboard. Without it, uploads go to `.data/uploads` (local only). |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | for `pnpm seed`    | First admin account, created only when there are no users.                                                             |
| `REVALIDATE_SECRET`                             | yes (prod)         | Shared secret for `POST /api/revalidate` (`openssl rand -hex 32`).                                                     |
| `NEXT_PUBLIC_SITE_URL`                          | no                 | Overrides the canonical / OG / sitemap base URL (default `https://igchkochi.com`).                                     |

## Admin panel (`/admin`)

Sign in with email and password. Every user can edit everything (single role) and add or remove other users.

| Section                | Edits                                                                                     | Shows on                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Doctors**            | name, speciality, qualifications, photo, group pages, featured, OPD days                  | home, About, Specialities (finder), group pages                |
| **Departments**        | group, name, short name, description, badge, icon colour                                  | Specialities hub + group pages, home department explorer       |
| **News**               | headline, date, summary, full story (gets `/news/<slug>`), tag, image, featured           | News & Updates, home news block                                |
| **Notices & tenders**  | announcement / tender, date or closing date, status, PDF                                  | notice boards on home and News & Updates                       |
| **Wellness articles**  | title, topic, summary, article text (gets `/wellness-library/<slug>`), review line, image | Wellness Library, home article cards, group page reading lists |
| **FAQs**               | question, answer, open by default                                                         | home FAQ + FAQ structured data                                 |
| **Site settings**      | announcement bar, emergency number, booking link, address, accreditations, social links   | header and footer of every page                                |
| **Users / My account** | add/remove users, change your password                                                    |                                                                |

Every list item has a display order and a **Visible on the website** switch (drafts). Saving updates the live site immediately (`updateTag`), with no redeploy.

**Security:** passwords are hashed with scrypt; the session is a signed, HTTP-only cookie (7 days). `proxy.ts` redirects signed-out visitors, and every admin page and server action re-checks the user (`lib/auth/dal.ts`). Five wrong passwords lock the account for 15 minutes. Admin pages are `noindex`.

## How the content layer works

```
component ─► lib/content/index.ts    getDoctors(), getNews(), getHomePage() …  ('use cache' + cacheTag, zod validation)
              └► lib/content/source.ts
                   ├─ page copy        content/*.json         (headings, hero text, navigation: edited by developers)
                   └─ admin-managed    MongoDB collections    (doctors, departments, news, notices, articles, FAQs, settings)
                                       └ without MONGODB_URI: content/seed/*.json
```

- **Seed data** (`content/seed/`) is the content the site launched with, including the placeholders still to be replaced (`[Doctor name]`, `[Headline]`, `[Announcement title]`…). It is both the fallback without a database and what `pnpm seed` loads. `pnpm test:interactions` checks every seed item against the admin validation.
- **Page copy** (`content/*.json`) changes with a redeploy. Types and zod schemas are in `lib/content/schemas.ts`.
- **Cache tags:** `content:<key>` per document or collection (`doctors`, `departments`, `news`, `notices`, `articles`, `faqs`, `site`, and the copy documents). `POST /api/revalidate` with `{"documents": [...]}` still works for external triggers.
- **Missing data is safe:** the site schemas never throw; invalid items are dropped and empty sections aren't rendered. A database _error_ is not cached: the last good page keeps being served.

## Project structure

```
app/(site)/     public pages (shared header/footer layout)
app/admin/      admin: login, dashboard, generic list/new/edit pages, settings, users
app/uploads/    serves local uploads when Cloudinary is not configured
components/     icons/  ui/  layout/  sections/  page/  admin/  illustrations/ …
content/        page copy (JSON); content/seed: default data for the admin collections
lib/content/    schemas, data source, cached getters, cache tags
lib/db/         MongoDB connection + Mongoose models
lib/auth/       password hashing, session token, data access layer
lib/admin/      resource definitions, server actions, form parsing, uploads, settings
proxy.ts        optimistic /admin guard
scripts/        seed, local MongoDB, legacy server, admin test server
styles/         site CSS partials (+ admin.css)
tests/          Playwright: visual/, interactions/, admin/
```

### Styling rules

- `styles/` is the original CSS, imported in cascade order from `app/layout.tsx`. Keep class names as they are, and add new rules in the partial for the section they belong to.
- `styles/` is excluded from Prettier on purpose.
- Colours changed for accessibility are marked with `a11y:` comments.

## Deploying to Vercel

1. **Database:** create a free MongoDB Atlas cluster (or add MongoDB Atlas from the Vercel Marketplace). Create a database user, allow access from Vercel (Network Access → `0.0.0.0/0`, or Atlas's Vercel integration), and copy the `mongodb+srv://…/igch` connection string.
2. **Images:** create a free Cloudinary account and copy the **API environment variable** (`cloudinary://…`).
3. **Vercel env vars** (Production + Preview): `MONGODB_URI`, `SESSION_SECRET`, `CLOUDINARY_URL`, `REVALIDATE_SECRET`, optionally `NEXT_PUBLIC_SITE_URL` for previews.
4. **Seed production once**, from your machine:
   ```bash
   MONGODB_URI="mongodb+srv://…/igch" ADMIN_EMAIL=you@igchkochi.com ADMIN_PASSWORD='a-long-password' pnpm seed
   ```
   Re-running is safe: it only fills empty collections and never touches existing users.
5. Import the repo in Vercel (install `pnpm install`, build `pnpm build`), deploy, point `igchkochi.com` at it, then sign in at `/admin`.

Use a separate database for Preview deployments so testing never edits the live site.
