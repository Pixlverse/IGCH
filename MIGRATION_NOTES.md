# IGCH → Next.js Migration Notes

Status: **Home page converted and verified.** 59/59 tests pass. The visual diff is fully explained (§10).

Production domain: **https://igchkochi.com**

---

## 1. Inventory of the original site

The original files are preserved untouched in `legacy/` and serve as the visual-diff baseline.

### 1.1 Files

| File                | Notes                                                                      |
| ------------------- | -------------------------------------------------------------------------- |
| `legacy/index.html` | The only page. 864 lines. Inline SVG sprite and an inline `<script>`.      |
| `legacy/styles.css` | 1,612 lines. Tokens → base → shared → sections → responsive → performance. |
| `legacy/images/`    | 22 files. **15 used**, copied to `public/images/`. 7 unused, not copied.   |

**Unused images** (not shipped): `gangadharan.png`, `george.png`, `igch-building.png` (2.4 MB), `jojo.png`, `nigil.png`, `smallest_pacemaker.png`, `logo.png` (a white-on-transparent mark).

### 1.2 Routes

| URL                            | Original     | Next.js                                                  |
| ------------------------------ | ------------ | -------------------------------------------------------- |
| `/`                            | `index.html` | `app/page.tsx`                                           |
| `/index.html`                  | n/a          | 308 → `/` (in `next.config.ts`, in case old links exist) |
| `/robots.txt`, `/sitemap.xml`  | none         | generated                                                |
| `/icon.png`, `/apple-icon.png` | none         | generated from the official logo                         |
| `/api/revalidate`              | n/a          | content revalidation webhook (POST, secret)              |

All other links in the original are `#` placeholders or in-page anchors (`#about`, `#specialities`, `#guide`, `#facilities`, `#walkthrough`, `#blogs`, `#news`, `#nursing`, `#doctors`, `#ambulance`). They're unchanged.

### 1.3 Page sections (DOM order) → components

| #   | Section                                | Component                                                                              | Server / client           |
| --- | -------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------- |
| 0   | SVG sprite                             | `components/icons/SvgSprite.tsx`                                                       | server                    |
| 1   | Header (sticky)                        | `components/layout/Header.tsx`, with `HeaderShell` + `MenuToggle` and `LanguageToggle` | server + 2 client islands |
| 2   | Hero + 5G ambulance card               | `components/sections/Hero.tsx`, with `SearchForm`                                      | server + client island    |
| 3   | Stats                                  | `Stats.tsx`                                                                            | server                    |
| 4   | Centres of excellence                  | `Centres.tsx`                                                                          | server                    |
| 5   | Specialities + "How it works"          | `Specialities.tsx` → `SpecialitiesExplorer.tsx`                                        | client island             |
| 6   | Doctors                                | `Doctors.tsx`                                                                          | server                    |
| 7   | Patient & visitor guide + walk-through | `Guide.tsx`                                                                            | server                    |
| 8   | Facilities + ambulance banner          | `Facilities.tsx`                                                                       | server                    |
| 9   | Co-operative difference                | `Coop.tsx`                                                                             | server                    |
| 10  | News + notice board                    | `News.tsx` → `NoticeBoard.tsx`                                                         | server + client island    |
| 11  | Wellness library                       | `Blogs.tsx`                                                                            | server                    |
| 12  | FAQ (native `<details name>`)          | `Faq.tsx`                                                                              | server, no JS             |
| 13  | Nursing school                         | `Nursing.tsx`                                                                          | server                    |
| 14  | Footer                                 | `components/layout/Footer.tsx`                                                         | server                    |

Shared UI: `Icon`, `Button`, `Tag`, `TextLink`, `SectionHead`, `SmartLink` (next/link for internal and `#anchor` links, `<a>` for `#`, `tel:` and external), `ContentImage` (next/image), `Brand`.

### 1.4 Scripts and interactions: original → React

| #   | Behaviour                                                                                                                        | Now                                                                        | Verified     |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------ |
| J1  | Mobile menu (`.is-open`, `aria-expanded`)                                                                                        | `HeaderShell` context + `MenuToggle`                                       | ✓ both sites |
| J2  | Language toggle (visual only)                                                                                                    | `LanguageToggle`                                                           | ✓ both sites |
| J3  | Department filter (counts, empty state, `.is-dim`; also matches the number, as `li.textContent` did)                             | `SpecialitiesExplorer`                                                     | ✓ both sites |
| J4  | Notice board tabs (roving tabindex, sliding pill, "View all" text; both arrow keys go to the _next_ tab, an original quirk kept) | `NoticeBoard`                                                              | ✓ both sites |
| J5  | "How it works" tracker (hover group → 1, hover/focus dept → 2, click → 3)                                                        | `SpecialitiesExplorer`                                                     | ✓ both sites |
| —   | Search form (no-op submit)                                                                                                       | `SearchForm` (react-hook-form + zod; `onSearch` prop for a future backend) | ✓ both sites |
| —   | FAQ exclusive accordion                                                                                                          | native `<details name="faq">`                                              | ✓ both sites |
| —   | Anchor smooth scroll (CSS)                                                                                                       | unchanged. Next 16 doesn't override `scroll-behavior`                      | ✓ both sites |

Every original CSS animation (ping, drive, siren, wave, road, ring, rise) and hover transition is unchanged, because the CSS is unchanged.

### 1.5 Forms and third parties

- **Forms:** the hero search only. It has no backend, and submitting stays on the page as before.
- **Third parties:** Google Fonts is now self-hosted. Vercel Analytics is added and only renders on Vercel.

### 1.6 Things in the original that look wrong, kept as-is

1. Placeholder copy is kept verbatim: `[Date]`, `[DD]`, `[Mon]`, `[Announcement title]`, `[Tender notice title]`, `Last date: [date]`, `[mobile number]` (FAQ 1), `Sample title` (blogs). It's all in `/content` now.
2. The About / Specialities / Guide / Facilities nav items show a dropdown chevron, but no dropdowns exist. Kept, and it's a `hasMenu` flag in `content/navigation.json`.
3. Dead CSS (`.card`, `.facility .icon-box`) is kept, since the CSS is verbatim.
4. Counts are now **derived** from content instead of hardcoded: "Search 30 departments", "10 departments", board badges "3" / "2", journey "/ 3". The output is identical today and stays correct after edits.
5. Dept links: the original called `preventDefault()` on every department click. It still does for `#` placeholders, but **a real URL set in the CMS will navigate**. Otherwise department pages could never be linked.

---

## 2. Architecture

```
app/            layout.tsx (html, font, sprite, header/footer), page.tsx (home + JSON-LD),
                api/revalidate, robots.ts, sitemap.ts, icon.png, apple-icon.png, fonts/
components/     icons/, ui/, layout/, sections/, motion/
content/        12 JSON documents: the exact original copy
lib/content/    schemas.ts (zod + types), source.ts (THE swap point), index.ts (cached getters),
                tags.ts, format.ts
lib/seo.ts      metadata + JSON-LD builders
styles/         original styles.css split verbatim into 20 ordered partials
public/images/  the 15 used images
legacy/         untouched original site (baseline)
scripts/        serve-legacy.mjs (static server for the baseline)
tests/          visual/ (pixel + DOM parity), interactions/ (behaviour, a11y, SEO, content)
```

---

## 3. CSS (decision D1: ordered global partials)

- `legacy/styles.css` is split at its own section comments into `styles/00-tokens.css … 99-performance.css`. They're imported from `app/layout.tsx` **in the original order**, so the cascade is unchanged. Class names are unchanged too, with no hashing.
- Concatenating the partials reproduces the original file byte for byte, apart from the changes below. `styles/` is excluded from Prettier so it stays verbatim.
- CSS changes, all tagged with an `a11y:` comment in the source:
  - `--font` token: `"Plus Jakarta Sans"` → `var(--font-jakarta, "Plus Jakarta Sans")` (self-hosted font).
  - The WCAG colour tweaks in §9.

---

## 4. Enhancement libraries (decision D3)

| Library                                  | Status | Notes                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **motion**                               | ✅     | `components/motion/RevealOnScroll.tsx`. 500 ms ease-out fade/rise (16px) on 21 section blocks marked `data-reveal`. **Only blocks that start below the fold** are animated. No wrapper elements. Inline styles are removed afterwards, so the resting state is the original CSS. Disabled under `prefers-reduced-motion`. With JS off, everything is visible (tested). |
| **@vercel/analytics**                    | ✅     | Rendered only when `VERCEL` is set, because `/_vercel/insights` 404s elsewhere.                                                                                                                                                                                                                                                                                        |
| **zod**                                  | ✅     | Content schemas, revalidate body, search form.                                                                                                                                                                                                                                                                                                                         |
| **react-hook-form**                      | ✅     | Hero search. Same markup; adds `name="q"`.                                                                                                                                                                                                                                                                                                                             |
| **clsx**                                 | ✅     |                                                                                                                                                                                                                                                                                                                                                                        |
| lenis, sonner, GSAP, swiper, next-themes | ❌     | Not added, per the brief's rules and your decision D3.                                                                                                                                                                                                                                                                                                                 |

---

## 5. Content layer (admin-panel ready)

### 5.1 How it works

```
component  →  getDoctors()        lib/content/index.ts   'use cache' + cacheTag('content', 'content:doctors')
                  ↓                                      + cacheLife('max'), then zod parse
              loadDocument(key)   lib/content/source.ts  ← the ONLY file to change for a CMS/API/DB
                  ↓
              content/doctors.json
```

- **Components never import JSON or know the data source.** Swapping to a CMS means rewriting `loadDocument` in `lib/content/source.ts`. If the CMS returns a different shape, map it there too.
- **Forgiving schemas:** a missing or malformed field becomes an empty value. Invalid list items are dropped individually, and unknown enum values fall back to a safe default. Parsing `{}`, `null` or garbage never throws (tested). Components hide empty optional pieces (tags, CTAs, images), and sections without items aren't rendered.
- **Design stays in code; content picks from enums:** tag tones, icon names (from the sprite), card variants, blog accents, facility tones (mapped to the original `--tone`/`--tint` hex pairs).
- **Templates:** `{phone}` / `{count}` placeholders in copy, e.g. `"Call {phone}"` or `"Search {count} departments"`.
- **Rich text** is modelled as structured fields (`title.line1/accent/rest`, `heading.main/emphasis`) rather than HTML. There's no `dangerouslySetInnerHTML` for content.

### 5.2 Revalidation

`POST /api/revalidate` with the header `x-revalidate-secret: $REVALIDATE_SECRET`:

```json
{ "documents": ["doctors", "faqs"], "paths": ["/"] }
```

An empty body refreshes all content (the `content` tag). It uses `revalidateTag(tag, { expire: 0 })`, so the next request gets fresh data rather than a stale copy. Auth uses a constant-time comparison. A missing or wrong secret returns 401, and an unknown document key returns 400 (tested).

> **Note:** while the source is local JSON, content is bundled at build time, so a JSON edit needs a redeploy. Revalidation takes effect as soon as `loadDocument` reads from a live CMS/API/DB. No other change is needed.

### 5.3 Editable-content map (input for admin-panel scoping)

**Site settings** (`site.json`)

- Hospital name, location line (header), full + structured address (footer, JSON-LD), society/unit line
- Logo (image + alt). The favicon is generated from it at build time
- Emergency phone (display / tel / international), labels: "24/7 Emergency", "Emergency & ambulance · 24/7", "Emergency & Ambulance", "Open 24 hours, every day", "Call now"
- Booking link (label + URL), used by the header, hero and footer buttons
- Accreditation badges (NABH Accredited, CGHS Empanelled)
- Languages (EN, മലയാളം), language group label, menu button label
- Social links (label + URL) ×3, copyright line
- SEO defaults: site URL, title, description, OG image, locale

**Navigation** (`navigation.json`)

- Header nav: 8 items (label, target, chevron flag)
- Footer: 4 columns (heading + links)

**Home page** (`home.json`)

- SEO: page title, description
- **Hero:** tag, title (line 1 / accent / rest), lead, secondary CTA, search (label, placeholder, button), quick chips ×6, photo, 5G card (badge, "new" label, title, subtitle, link label, target)
- **Stats:** aria label; items ×3 (value, caption, style: green / plain / lime)
- **Section heads** for centres, specialities, doctors, guide, facilities, news, blogs: eyebrow, heading, wide flag, link (label + URL)
- **Specialities copy:** journey heading + 3 steps (label, title, hint, icon), filter placeholder / aria label, help text, count words, empty-state text
- **Walk-through:** tag, title, body, CTA, play-button label, image
- **Ambulance banner:** tag, heading, call label, image
- **Co-operative:** tag, heading (main + emphasis), body, points ×3, CTAs (label, URL, white / outline), image
- **FAQ:** tag, heading
- **Nursing school:** tag, heading, paragraphs, CTA, image

**Collections**

- `centres.json`: feature + cards (image, tag + tone, title, body, link, card variant)
- `specialities.json`: groups (title, tagline, icon, colour, "view all" link) → departments (name, URL)
- `doctors.json`: name, department, qualifications, profile URL, photo. Order = display order
- `guide.json`: hero (image, title, body), cards (icon, tone, title, body, URL, optional tag, optional steps), CTA tile
- `facilities.json`: icon, tone, title, body, URL
- `news.json`: featured story (image, tag, badge, meta line, title, teaser, link label, URL) + secondary stories (image, tag, title, date, URL)
- `notices.json`: board title; announcements (day, month, title, kind, URL); tenders (day, month, title, status, last date, URL); per-tab "view all" links
- `blogs.json`: category tag, accent, title, meta line, URL
- `faqs.json`: question, answer paragraphs, open-by-default flag. Also feeds the FAQPage structured data

**Suggested admin priorities:** Notices/Tenders and News change most often. Doctors and Departments are next, then FAQ and Blogs. Site settings (phones, booking URL) are rarely edited but high-impact.

---

## 6. Fonts and images

- **Font:** `next/font/local` with Google's own latin variable `woff2` for Plus Jakarta Sans (`app/fonts/`). It's the same file Google Fonts served the original for 400–800, with the same unicode-range, preloaded and `display: swap`. The font is no longer render-blocking from a third-party origin.
  - Why not `next/font/google`: in Next 16.4 Turbopack it (a) broke `next dev` when a weight list was given, and (b) ignored `adjustFontFallback: false`. The injected Arial fallback then drew `→` (a glyph the font lacks) differently from the original's `system-ui`, and pill links shifted 6px. Self-hosting fixes both. CLS is still 0.
- **Images:** `next/image` without `fill`, so it renders a single `<img>` with no wrapper and the original CSS sizes it. Width/height attributes come from the content (intrinsic size) to reserve space. `sizes` hints match the CSS grid. AVIF/WebP at quality 80. The hero is preloaded with `fetchpriority=high`, and the header logo is eager. The 1 MB logo is now served at 48/96 px.

---

## 7. SEO

| Item                       | Before | Now                                                                                                                           |
| -------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Title, description         | ✓      | ✓ identical, editable                                                                                                         |
| Canonical                  | —      | `https://igchkochi.com`                                                                                                       |
| Open Graph / Twitter       | —      | title, description, url, site name, locale `en_IN`, image (hero photo), `summary_large_image`                                 |
| Favicon / Apple touch icon | —      | from `officiallog.png` (256 px / 180 px)                                                                                      |
| Structured data            | —      | `Hospital` (name, address, phone, logo, 24/7 hours, emergency, 30 specialities) + `FAQPage` (5 Q&As), both built from content |
| robots.txt / sitemap.xml   | —      | ✓ (`/api/` disallowed)                                                                                                        |
| `theme-color`              | —      | not added on purpose: it would tint mobile browser chrome, which is a visible change                                          |

**Recommendation:** add a dedicated 1200×630 OG image. The hero photo is portrait and will be cropped by social platforms. Set it in `site.json → seo.ogImage`.

---

## 8. Decisions log

| #   | Decision                  | Choice                                                         |
| --- | ------------------------- | -------------------------------------------------------------- |
| D1  | CSS organisation          | Ordered global partials, original class names and cascade      |
| D2  | Images                    | next/image; resampling differences accepted and measured (§10) |
| D3  | Enhancements              | motion (below-the-fold reveals only), @vercel/analytics        |
| D4  | Package manager / hosting | pnpm 12, Vercel                                                |
| D5  | Original site             | Moved untouched to `legacy/`                                   |
| D6  | Forms                     | zod for content; react-hook-form on the hero search            |
| D7  | Domain                    | https://igchkochi.com (`NEXT_PUBLIC_SITE_URL` overrides)       |
| D8  | Favicon                   | Official logo (`officiallog.png`)                              |
| D9  | Contrast                  | Small colour tweaks allowed without approval; applied in §9    |
| D10 | Font loading              | Self-hosted via next/font/local (see §6 for why)               |

---

## 9. Deviations from the original

### 9.1 Visible (approved colour tweaks for WCAG AA 4.5:1)

| Element                                                         | Before                                     | After                                                                         | Contrast    |
| --------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------- | ----------- |
| Red buttons (`.btn--red`), emergency pill, "5G" chip background | `#e5484d`                                  | `#d93a40` (new `--red-text-bg` token; decorative red dots/rings keep `--red`) | 3.91 → 4.54 |
| Emergency pill hover                                            | `#d63a40`                                  | `#cc3439` (kept darker than the new base)                                     | n/a         |
| Emergency pill label ("24/7 EMERGENCY")                         | white 85%                                  | white                                                                         | 3.22 → 4.54 |
| Department numbers (`.dept__no`)                                | `#9aa4a1`                                  | `#6e7875`                                                                     | 2.56 → 4.56 |
| "How it works" inactive steps                                   | step opacity .5, label 45%, hint 55% white | opacity .8, label and hint 62% white                                          | 2.05 → 5.08 |
| Co-op point captions                                            | white 78%                                  | white 92%                                                                     | 3.79 → 4.59 |

The active step is still clearly highlighted (tint + lime text). These tweaks account for ~1,800–2,300 changed pixels per page (≈0.02%).

### 9.2 Invisible (markup / a11y / behaviour)

1. Footer column headings `<h4>` → `<h3>` (valid heading order). CSS selector extended, look identical.
2. Notice board: `role="tabpanel"` moved from the `<ul>` to a wrapping `<div class="board__list">` so the list keeps its semantics. CSS unaffected.
3. Header brand link: `aria-label="IGCH home"` removed (the name now comes from the visible text and logo alt).
4. Emergency pill: `aria-label` removed. Below 640px the text is now visually hidden (clip) instead of `display:none`, so the icon-only pill keeps an accessible name. It looks the same.
5. All icon `<svg>`s get `aria-hidden="true"`. The search button gets `aria-label` (its text is hidden on phones). Buttons get `type="button"`. The menu toggle gets `aria-controls`.
6. The search input gets `name="q"` (react-hook-form).
7. The 4 unused SVG figure symbols (`fig-doctor`, `fig-patient`, `fig-person`, `fig-heart`) were dropped from the sprite.
8. Department links with real URLs navigate (see §1.6.5).
9. Entrance reveals below the fold (motion, §4), which is new by design.

The DOM-parity test replays items 1–4 on the original DOM and ignores items 5–6. Any other markup or copy difference fails the test.

---

## 10. Verification results

All commands were run against the production build (`pnpm build && pnpm test`) in Chromium 1248 on macOS.

### 10.1 Visual regression (`tests/visual/visual-parity.spec.ts`)

Full-page screenshots of `legacy/` and the Next.js build, compared with pixelmatch (threshold 0.1). Anti-aliasing is detected and excluded. Page heights are **identical** at every width.

| Width | Height | Changed px | Ratio  | In photos (resampling) | In a11y-tweaked elements | **Unexplained** |
| ----- | ------ | ---------- | ------ | ---------------------- | ------------------------ | --------------- |
| 320   | 22,298 | 11,546     | 0.153% | 9,725                  | 1,821                    | **0**           |
| 375   | 21,229 | 13,022     | 0.164% | 11,201                 | 1,821                    | **0**           |
| 768   | 15,345 | 12,858     | 0.109% | 10,974                 | 1,884                    | **0**           |
| 1024  | 10,251 | 15,456     | 0.140% | 13,190                 | 2,266                    | **0**           |
| 1280  | 9,735  | 17,033     | 0.137% | 14,775                 | 2,253                    | **5**           |
| 1440  | 9,885  | 29,845     | 0.210% | 27,599                 | 2,245                    | **1**           |
| 1920  | 9,867  | 17,691     | 0.093% | 15,446                 | 2,245                    | **0**           |

The 1–5 "unexplained" pixels are anti-aliasing on rounded photo corners just outside the `<img>` box. The test enforces ≤0.5% total and ≤50 unexplained pixels. Screenshots and diff images are written to `tests/.artifacts/visual/`.

### 10.2 DOM parity (`tests/visual/dom-parity.spec.ts`)

The serialised `.container` subtree (tags, classes, ids, hrefs, ARIA, roles, inline styles, every text node) is **identical** to the original, after replaying the approved changes in §9.2. ✓

### 10.3 Interactions (`tests/interactions/behaviour.spec.ts`)

8 behaviour specs run against **both** sites with identical assertions (16 tests, all pass): menu, language toggle, filter, tracker, tabs, FAQ, anchors, search.

Next-only specs:

- No console warnings or errors (production build). Dev mode was also checked manually with a clean console.
- Content is visible with JS disabled.
- Reveals settle with no leftover inline styles.
- With reduced motion, nothing is hidden.
- SEO tags, canonical, icons, JSON-LD, robots and sitemap are present.
- The revalidate endpoint enforces auth and validation and succeeds with the secret.

### 10.4 Accessibility (`tests/interactions/a11y.spec.ts`)

axe-core full-page scan at 375 and 1440 px: **0 violations**. The original (measured the same way) had 6 rule types with 45 nodes at 375 px and 49 at 1440 px: aria-allowed-role, button-name (the search button has no name on phones), color-contrast, heading-order, label-content-name-mismatch, listitem.

### 10.5 Content (`tests/interactions/content-schemas.spec.ts`)

Every JSON document parses without fallbacks and contains no keys the schema ignores (this catches typos). Every schema survives `undefined` / `null` / `{}` / garbage. Invalid items are dropped and bad enums fall back.

### 10.6 Lighthouse 13.5 (local `next start`, default throttling)

|                      | Performance | Accessibility | Best practices | SEO     | LCP   | CLS   |
| -------------------- | ----------- | ------------- | -------------- | ------- | ----- | ----- |
| Original, mobile     | 71          | 88            | 96             | 100     | 6.2 s | 0     |
| Original, desktop    | 95          | 92            | 96             | 100     | 1.3 s | 0.053 |
| **Next.js, mobile**  | **95**      | **100**       | **100**        | **100** | 3.0 s | **0** |
| **Next.js, desktop** | **100**     | **100**       | **100**        | **100** | 0.7 s | **0** |

Re-check on the Vercel preview URL after the first deploy. Real CDN numbers usually beat local throttled runs.

### 10.7 Static checks

`pnpm typecheck` (strict, `noUncheckedIndexedAccess`), `pnpm lint` (eslint-config-next core-web-vitals + TS) and `pnpm format:check` are all clean.

---

## 11. Open items / next steps

1. Replace the placeholder copy (§1.6.1) and `#` links once the real content and pages exist.
2. Add a 1200×630 OG image (§7).
3. Build the admin panel / CMS and implement `loadDocument` against it. Call `/api/revalidate` from its publish hook.
4. Malayalam: the toggle is still visual only. When translations exist, add a locale dimension to `loadDocument(key, locale)` and an `/ml` route. Components won't need to change.
5. Department, doctor and blog detail pages: their URLs are already content fields.

---

## 12. Phase 1 inner pages (from `IGCH Website · Phase 1 Pages.pdf`)

### 12.1 Routes

| URL                                | Page file                                    | Content document(s)                                     |
| ---------------------------------- | -------------------------------------------- | ------------------------------------------------------- |
| `/about`                           | `app/about/page.tsx`                         | `about.json`, `doctors.json`                            |
| `/specialities`                    | `app/specialities/page.tsx`                  | `specialities-hub.json`, `specialities.json`, `doctors` |
| `/specialities/super-specialities` | `app/specialities/<slug>/page.tsx` (3 files) | `speciality-groups.json` (keyed by slug) + the above    |
| `/specialities/broad-specialities` | → shared `components/specialities/GroupView` | + `library.json` (wellness cards by article id)         |
| `/specialities/clinical-support`   |                                              |                                                         |
| `/news`                            | `app/news/page.tsx`                          | `news-page.json`, `notices.json`                        |
| `/wellness-library`                | `app/wellness-library/page.tsx`              | `library.json`                                          |
| `/facilities`                      | `app/facilities/page.tsx`                    | `facilities-page.json`                                  |

The three group pages are separate static routes, not `[group]`: `dynamicParams` is unavailable with Cache Components, and static files keep unknown slugs a 404. All pages prerender as static (`next build`). The sitemap lists them.

### 12.2 Decisions

| #   | Decision        | Choice                                                                                                                              |
| --- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| D11 | Header / footer | The PDF versions replace the old ones **site-wide**, home included (white header + announcement strip, 5-column footer + wordmark). |
| D12 | Imagery         | PDF illustrations recreated as inline SVG (`components/illustrations`); real doctor photos kept, illustrated avatar when none.      |
| D13 | Department data | `specialities.json` now follows the PDF: 31 departments (Broad +Palliative Medicine, +Ayurveda; Clinical −Pain & Palliative Care).  |
| D14 | Container width | Kept the site's existing container (the PDF frames use a narrower 1280px column) so inner pages line up with home.                  |

### 12.3 Behaviour

- **Nav:** active section highlighted (`aria-current`); dropdowns open on hover and keyboard focus (CSS `:focus-within`, no JS); the mobile menu closes after navigating.
- **Specialities search:** matches department names/descriptions and links to `/specialities/<group>#dept-<slug>`.
- **Doctor finder:** filters by speciality, name and OPD day (`doctors.json → days`; empty = any day). Shows featured doctors before a search.
- **News:** All / News / Announcements / Tenders filters; latest news paginates (`pageSize`).
- **Wellness Library:** topic pills + search, 9 per page; the featured article shows only when unfiltered.
- Pagination is hidden when there is one page, so it appears only once there is enough content.

### 12.4 Home-page changes and tests

- Home section links now point at the new pages; home doctors are filtered to `featured`.
- Parity tests (`tests/visual`) compare `<main>` only and exclude `#specialities` (new department data). The new link targets are replayed on the legacy DOM (`tests/support/approved-changes.ts`). The behaviour tests use per-site department counts.
- New: `tests/interactions/pages.spec.ts` (every page + all interactions); axe now scans all 9 pages at 375/1440 px with 0 violations.
- Result: **90/90 tests pass**; lint, typecheck and format are clean.

### 12.5 Open items

1. Placeholder copy from the PDF is kept verbatim (`[Year]`, `[Name]`, `[Doctor name]`, `[Headline]`, `[Insurer logo]`…). Replace it in `/content`.
2. Home's "Wellness library" cards still read `blogs.json`; point them at `library.json` so there is one article source.
3. Pre-existing: the legacy home page overflows horizontally at 320px (`.coop__body`, `.nursing__art`). The new pages do not.

---

## 13. Admin panel (MongoDB) — see README "Admin panel"

| #   | Decision        | Choice                                                                                                                  |
| --- | --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| D15 | Data store      | MongoDB (Mongoose). Lists that change often + site settings are collections; page copy stays in `content/*.json`.       |
| D16 | Uploads         | Cloudinary (`CLOUDINARY_URL`); local `.data/uploads` fallback for development only.                                     |
| D17 | Accounts        | Single role, multiple users; email + scrypt password; signed HTTP-only session cookie (jose); lockout after 5 failures. |
| D18 | Seed / fallback | `content/seed/*.json` = launch content. Loaded by `pnpm seed`; also rendered directly when `MONGODB_URI` is unset.      |
| D19 | Freshness       | Admin saves call `updateTag('content:<collection>')`: changes are live immediately, pages stay statically cached.       |

Content changes that came with it: home news and the News page now share one news list (the featured story leads both), notices get real dates ("–/TBC" until set), the home article cards show the first four Wellness Library articles, and news/articles with text get their own pages (`/news/<slug>`, `/wellness-library/<slug>`). Parity tests therefore also skip `#news` and `#blogs`.

Verification: `pnpm test` 103/103 (no database), `pnpm test:admin` 13/13 (throwaway MongoDB: login, lockout-safe errors, add/edit/hide/delete, uploads, detail pages, settings, users, axe at 1280/390 px).
