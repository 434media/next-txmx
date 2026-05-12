# TXMX Boxing

The official platform for TXMX Boxing — TDLR-sanctioned event results,
verified fighter profiles, ringside news ("The 8 Count"), Prop Picks, Polls,
Gym Pledge, the Black Card subscription, and the Rise of a Champion
Iconic Series.

**Site:** https://www.txmxboxing.com

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 16** (App Router, Server Actions, Turbopack) |
| UI | **React 19** + **Tailwind CSS 4** + Geist font |
| Data | **Firebase / Firestore** (Admin SDK server-side, client SDK in-browser) |
| Auth | Firebase Auth (Google sign-in) |
| Payments | **Stripe** (Black Card subscription + Iconic Series checkout) |
| Email | **Resend** (newsletter + transactional) |
| Storage | Firebase Storage + Google Drive (event galleries) |
| Push | Web Push (notifications) |
| Bot defense | Vercel **BotID** |
| Analytics | Vercel Analytics |
| Hosting | **Vercel** (Edge + Node serverless + Python serverless function) |

### Main dependencies

From [package.json](./package.json):

- `next@^16.0.7`, `react@^19.2.1`, `react-dom@^19.2.1`
- `firebase@^12`, `firebase-admin@^13`
- `stripe@^19`, `@stripe/stripe-js@^8`, `@stripe/react-stripe-js@^5`
- `resend@^6`
- `googleapis@^168` (Drive integration)
- `airtable@^0.12` (legacy import flow)
- `web-push@^3` (notifications)
- `botid@^1.5`
- `motion@^12` (animations)
- `lucide-react@^0.511`
- `geist@1.7` (font)
- `@vercel/analytics`
- Dev: `typescript@^5.9`, `tailwindcss@^4`, `eslint@^9`, `eslint-config-next@^16`

---

## Folder Structure

```
next-txmx/
├── api/                    # Vercel Python serverless function (tdlr-parse.py)
├── app/                    # Next.js App Router
│   ├── actions/            # Server actions (database + business logic)
│   ├── admin/              # Protected admin dashboard
│   ├── api/                # Next.js Route Handlers
│   ├── 8count/             # "The 8 Count" ringside news feed
│   ├── checkout/           # Black Card subscription (Stripe)
│   ├── community/          # Fan community feed
│   ├── compare/            # Fighter comparison tool
│   ├── events/             # Events, fight-night, rise-of-a-champion
│   ├── fan-card/           # Public Fan Card pages (+ dynamic OG)
│   ├── fanos/              # Investor/partner overview — "fandom OS"
│   ├── fighters/           # Fighter directory + profiles
│   ├── leaderboard/        # Skill Points leaderboard
│   ├── locker/             # Private fan space (picks, pledges, activity)
│   ├── picks/              # Prop Picks (Black Card)
│   ├── pledge/             # Gym Pledge
│   ├── polls/              # Fan polls
│   ├── rewards/            # TX-Credits storefront
│   ├── scorecard/          # Engagement platform overview
│   ├── seasons/            # Season progression
│   ├── client-layout.tsx   # Root client layout (nav, modals, providers)
│   ├── layout.tsx          # Root metadata + server layout
│   ├── opengraph-image.tsx # Root OG (shared logo template)
│   ├── robots.ts           # robots.txt generator (allows AI crawlers)
│   └── sitemap.ts          # Sitemap (static + dynamic from Firestore)
├── components/             # Reusable React components
│   ├── gallery/            # Image gallery + lightbox
│   ├── iconic-series/      # Rise of a Champion components
│   ├── icons/              # Custom SVG icons
│   └── ui/                 # Base UI primitives (button, input)
├── docs/                   # Setup documentation
├── lib/                    # Utilities, config, types
│   ├── og-template.tsx     # Shared OG ImageResponse template (logo + brand)
│   ├── json-ld.ts          # Schema.org JSON-LD generators
│   ├── firebase-admin.ts   # Server-side Admin SDK
│   ├── firebase-client.ts  # Client SDK + Google auth
│   ├── auth-context.tsx    # React auth context
│   ├── stripe.ts           # Server-side Stripe client
│   ├── google-drive.ts     # Drive API for event galleries
│   ├── tdlr-parser.ts      # TDLR PDF parser
│   ├── iconic-series-products.ts
│   ├── use-feature-flag.ts
│   └── types/              # TypeScript types (Fighter, etc.)
├── public/                 # Static assets
│   ├── llms.txt            # LLM discoverability manifest
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker (push notifications)
│   ├── texas.png / texas.svg
│   └── (favicon under app/favicon.ico)
├── scripts/                # Data import + backfill scripts
└── tdlr-downloads/         # Archived TDLR result JSON files
```

### Public routes

| Route | Description |
|-------|-------------|
| `/` | Landing page + hero video |
| `/8count` · `/8count/[slug]` | "The 8 Count" — ringside news feed and post pages |
| `/fighters` · `/fighters/[slug]` | TDLR-licensed fighter directory + profiles |
| `/events` · `/events/[eventId]` | Event schedule and detail pages |
| `/events/fight-night` · `/events/fight-night/[id]` | Members-only Fight Night experience |
| `/events/rise-of-a-champion` | Rise of a Champion — Iconic Series landing |
| `/events/rise-of-a-champion/gallery` | Event gallery (Google Drive backed) |
| `/events/rise-of-a-champion/rsvp` | Invitation-only RSVP |
| `/compare` | Side-by-side fighter comparison |
| `/picks` | Prop Picks (Black Card) |
| `/polls` | Fan polls — earn TX-Credits |
| `/pledge` | Gym Pledge (16-week season) |
| `/leaderboard` | Skill Points leaderboard |
| `/community` | Fan community feed |
| `/locker` | Private fan space |
| `/rewards` | TX-Credits rewards store |
| `/seasons` | Season progression |
| `/fan-card` · `/fan-card/[userId]` | Shareable Fan Card |
| `/scorecard` | Engagement platform overview |
| `/fanos` | Investor/partner overview |
| `/checkout` | Black Card subscription |
| `/admin` | **Protected** admin dashboard (not indexed) |

### `app/actions/` — Server actions

Server-side data and business logic, callable from client components. Each
file is a focused slice of the domain:

| File | Purpose |
|------|---------|
| `fighters.ts` | Fighter CRUD, search, profile reads |
| `events.ts` | Events, bouts, results |
| `eight-count.ts` | "The 8 Count" posts |
| `users.ts` | User profiles, subscription status |
| `props.ts` · `match-picks.ts` | Prop Picks scoring |
| `polls.ts` | Polls + voting + TX-Credit rewards |
| `economy.ts` · `credits.ts` · `skill-points.ts` · `loyalty-points.ts` | Economy primitives |
| `stripe-subscribe.ts` · `iconic-series-stripe.ts` | Stripe checkout |
| `daily-login.ts` · `quests.ts` · `rewards-store.ts` | Engagement + rewards |
| `gyms.ts` · `venues.ts` | Reference data |
| `community.ts` · `user-blocks.ts` · `abuse-prevention.ts` · `rate-limiter.ts` | Community + safety |
| `event-checkin.ts` · `event-leaderboard.ts` · `event-prizes.ts` | Event-day flow |
| `fightnight*.ts` | Members-only Fight Night experience |
| `seasons.ts` · `fan-card.ts` | Seasons + Fan Card |
| `notifications.ts` | Web push delivery |
| `tdlr-import.ts` | TDLR PDF → Firestore |
| `email.ts` · `contact-form.ts` · `sharing.ts` · `onboarding.ts` · `feature-flags.ts` · `guest-session.ts` · `verified-manager.ts` | Misc. |

### `app/api/` — Route handlers

| Route | Description |
|-------|-------------|
| `/api/admin/upload` | Image upload to Firebase Storage |
| `/api/auth/profile` | Authenticated profile read |
| `/api/cron/tdlr-boxing` | Daily Vercel cron: fetch + parse TDLR results |
| `/api/gallery` · `/api/gallery-access` | Google Drive backed event galleries |
| `/api/iconic-series-inquiry` | Sponsorship inquiry intake |
| `/api/newsletter` | Resend newsletter subscription |
| `/api/rise-of-a-champion-rsvp` | RSVP intake |
| `/api/stripe/subscribe` · `/api/stripe/webhook` | Stripe checkout + webhooks |
| `/api/tdlr-parse` | Calls the Python `tdlr-parse.py` parser |

### `api/` — Python serverless

`tdlr-parse.py` — Vercel Python function that accepts a TDLR PDF and returns
structured JSON (event metadata + bout results). Called by the daily cron and
by admin uploads.

### `components/`

- **Top-level** — navbar, footer, hero, auth modal, newsletter, fan polls,
  notification bell, share button, subscribe button, calendar reminder,
  upsell banner, onboarding checklist, quest board, settlement toasts,
  live ribbon, etc.
- **`gallery/`** — lightbox + gallery unlock form
- **`iconic-series/`** — Rise of a Champion sponsorship forms, RSVP, Stripe
- **`icons/`** — custom SVG icons
- **`ui/`** — base primitives (`button.tsx`, `input.tsx`)

### `lib/`

| File | Purpose |
|------|---------|
| `og-template.tsx` | Shared `ImageResponse` template with the TXMX logo — used by every `opengraph-image.tsx` for consistent branded social cards |
| `json-ld.ts` | Schema.org JSON-LD generators: Organization (SportsOrganization), WebSite (with SearchAction), SiteNavigation, Person (fighters), SportsEvent (events), NewsArticle (8 Count posts), Breadcrumb, Event (Rise of a Champion) |
| `firebase-admin.ts` · `firebase-client.ts` · `auth-context.tsx` | Firebase wiring |
| `stripe.ts` | Server-side Stripe client |
| `google-drive.ts` · `gallery-images.ts` | Drive integration |
| `iconic-series-products.ts` | Sponsorship package definitions |
| `tdlr-parser.ts` | TDLR PDF parsing helpers |
| `use-feature-flag.ts` | Feature flag hook |
| `utils.ts` | `cn()` classname merger |
| `types/fighter.ts` | Fighter TypeScript types |

### `scripts/`

- `tdlr-backfill-settlement.mjs` — Backfill cryptographic settlement hashes
  (`pnpm backfill:tdlr` for dry-run; `pnpm backfill:tdlr:write` to persist)
- `tdlr-batch-import.mjs` — Batch import TDLR JSON into Firestore
- `tdlr-extract.py` — Extract fighter/bout data from TDLR PDFs
- `tdlr-scrape-boxing.py` — Scrape external boxing sources

### `tdlr-downloads/`

Downloaded TDLR boxing event results in JSON, named by date and event
(e.g. `01-20-24-43339-TMB-SAN-ANTONIO.json`). The source-of-truth for boxing
records imported into Firestore.

---

## Config Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Redirects (`riseofachampion.com` → `/events/rise-of-a-champion`), remote image patterns, BotID wrapper |
| `firebase.json` | Firestore database ID (`txmx`) |
| `firestore.rules` · `firestore.indexes.json` | Firestore security rules + indexes |
| `vercel.json` | Vercel cron: `/api/cron/tdlr-boxing` daily at 12 PM |
| `tsconfig.json` | TypeScript configuration |
| `postcss.config.mjs` | PostCSS / Tailwind CSS setup |
| `eslint.config.mjs` | ESLint config |
| `instrumentation-client.ts` | BotID path protection for form endpoints |

---

## SEO / OG / LLM Discoverability

This project ships with a comprehensive SEO + AI-discovery layer:

- **Per-page OG images** — every route has an `opengraph-image.tsx` that uses
  the shared template at [`lib/og-template.tsx`](./lib/og-template.tsx). The
  template fetches the official TXMX distressed logo from Firebase Storage
  and composes a branded 1200×630 card with page-specific title, subtitle,
  and tagline. Fighter, event, and 8 Count post routes generate **dynamic**
  OG images from live data.
- **JSON-LD** — schema.org structured data is emitted on the home page
  (`Organization` + `WebSite` + `SiteNavigation`), fighter profiles
  (`Person`), event detail pages (`SportsEvent`), and "The 8 Count" articles
  (`NewsArticle`). See [`lib/json-ld.ts`](./lib/json-ld.ts).
- **Sitemap** — [`app/sitemap.ts`](./app/sitemap.ts) ships every static route
  *and* dynamically generates entries for every published fighter, event,
  and 8 Count post from Firestore.
- **`llms.txt`** — [`public/llms.txt`](./public/llms.txt) gives LLMs a
  curated, machine-readable summary of what TXMX is, what it claims as
  authoritative (TDLR-sanctioned records), and which paths to avoid.
- **AI crawlers** — [`app/robots.ts`](./app/robots.ts) explicitly allows
  GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, and
  others. Private surfaces (`/admin/`, `/api/`, `/actions/`) stay blocked.
- **Metadata templating** — [`app/layout.tsx`](./app/layout.tsx) sets
  `metadataBase`, a title template (`'%s | TXMX Boxing'`), default
  keywords/authors/creator, openGraph + Twitter defaults, and robots
  directives. Each page overrides as needed.

When adding a new public route, follow this checklist:

1. Add a `metadata` (or `generateMetadata` for dynamic routes) export with
   `title`, `description`, `openGraph`, `twitter`, and `alternates.canonical`.
2. Drop an `opengraph-image.tsx` next to the page using `renderTxmxOg(...)`
   from `lib/og-template`.
3. If the page represents an entity (fighter, event, article), emit JSON-LD
   via the helpers in `lib/json-ld.ts`.
4. Add the route to `app/sitemap.ts` (or to the dynamic loop if it's a
   slug).
5. If the route should be public to LLMs, you're done — `robots.ts` already
   allows it. If it's private, add it to the `DISALLOW` array.

---

## Getting Started

### 1. Clone and install

```sh
git clone <your-repository-url>
cd next-txmx
pnpm install
```

### 2. Environment variables

Create `.env.local` in the project root. Ask the project administrator for
the values.

```env
# Firebase (server)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=

# Google Drive (for event galleries)
GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=

# Web push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

### 3. Run the dev server

```sh
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Production build

```sh
pnpm build
pnpm start
```

---

## GitHub PR Workflow

We follow a feature-branch workflow. All work lives on a dedicated branch and
merges into `main` via Pull Request — `main` is never committed to directly.

### 1. Sync `main`

```sh
git checkout main
git pull origin main
```

### 2. Create a feature branch

Name the branch by intent. Examples:

```sh
git checkout -b feature/fighter-share-card
git checkout -b fix/picks-scoring-edge-case
git checkout -b chore/upgrade-stripe-sdk
```

### 3. Commit using conventional commits

Keep commits small and self-contained. Prefix the subject so the changelog
reads cleanly:

```
feat:     new user-facing feature
fix:      bug fix
chore:    tooling, deps, infra, no behavior change
refactor: code restructure with no behavior change
docs:     documentation only
perf:     performance improvement
test:     tests only
```

```sh
git add path/to/changed/files
git commit -m "feat(picks): show round-by-round breakdown on settlement"
```

### 4. Push and open the PR

```sh
git push -u origin feature/your-feature-name
gh pr create --fill          # or open the PR in the GitHub UI
```

**PR description should answer three questions:**

1. **What** changed (one sentence)
2. **Why** — the user / business reason
3. **How to test** — a short checklist a reviewer can walk through

Example template:

```md
## Summary
- Adds round-by-round breakdown to the picks settlement screen.

## Why
- Users couldn't see *which* prediction earned points; only totals.

## Test plan
- [ ] Navigate to /picks after an event settles
- [ ] Verify each pick row shows method/round outcome vs. prediction
- [ ] Verify points awarded match leaderboard delta
```

### 5. CI + review

Vercel will build a **Preview Deployment** for every PR. Use that preview to
review user-facing changes. Wait for:

- Vercel preview deploys successfully
- At least one approving review (or self-merge if solo)

### 6. Merge

Use **Squash and Merge** so `main`'s history reads as one commit per feature.
The squash commit message should match the PR title.

### 7. Clean up

```sh
git checkout main
git pull origin main
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name   # if not auto-deleted
```

### Branch protection rules (recommended)

- `main`: require PR, require 1 approval, require status checks
  (Vercel preview), disallow direct pushes, allow squash merges only.
- Auto-delete head branches on merge: **on**.

### Things to *not* do

- Don't force-push to `main`.
- Don't bypass branch protection.
- Don't commit `.env.local` or any file with credentials. `.gitignore`
  already excludes them; double-check `git status` before committing.
- Don't commit generated artifacts: `.next/`, `node_modules/`,
  `tsconfig.tsbuildinfo`.

---

## Background Jobs

- **TDLR daily cron** (`vercel.json`) — runs `/api/cron/tdlr-boxing` once a
  day. Pulls new TDLR PDFs, parses them through the Python serverless
  function, and writes structured bout results to Firestore.

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Production server |
| `pnpm lint` | ESLint |
| `pnpm backfill:tdlr` | Dry-run TDLR settlement-hash backfill |
| `pnpm backfill:tdlr:write` | Persist TDLR settlement-hash backfill |
