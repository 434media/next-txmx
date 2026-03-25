# TXMX Boxing

The official platform for Texas-Mexico boxing — fighter profiles, TDLR-sanctioned event results, fan engagement, and ringside news.

Built with **Next.js 16** (App Router + Turbopack), **Firebase/Firestore**, **Stripe**, and **Tailwind CSS 4**.

---

## Folder Structure

```
next-txmx/
├── api/                    # Vercel Python serverless function
├── app/                    # Next.js App Router (pages, layouts, routes)
│   ├── actions/            # Server actions (database ops & business logic)
│   ├── admin/              # Admin dashboard (protected)
│   ├── api/                # Next.js API routes
│   ├── 8count/             # The 8 Count — ringside news feed
│   ├── checkout/           # Black Card subscription (Stripe)
│   ├── compare/            # Fighter comparison tool
│   ├── events/             # Event schedule & results
│   ├── fighters/           # Fighter directory & profiles
│   ├── leaderboard/        # Skill Points leaderboard
│   ├── picks/              # Prop Picks (bout predictions)
│   ├── pledge/             # Gym Pledge system
│   ├── polls/              # Fan polls
│   ├── riseofachampion/    # Rise of a Champion event pages
│   └── scorecard/          # Engagement platform landing
├── components/             # Reusable React components
│   ├── gallery/            # Image gallery & lightbox
│   ├── iconic-series/      # Rise of a Champion components
│   ├── icons/              # Custom SVG icons
│   └── ui/                 # Base UI primitives (button, input)
├── docs/                   # Setup documentation
├── lib/                    # Utilities, config, types
├── public/                 # Static assets, PWA manifest, service worker
├── scripts/                # Data import & backfill scripts
└── tdlr-downloads/         # Archived TDLR result JSON files
```

### `app/` — Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero section |
| `/fighters` | Searchable directory of TDLR-licensed boxers with dynamic `[slug]` profile pages |
| `/events` | TDLR-sanctioned boxing event schedule, past results, and upcoming fight cards |
| `/picks` | Prop Picks — predict bout outcomes, earn Skill Points (Black Card exclusive) |
| `/leaderboard` | Skill Points leaderboard ranking users by prediction accuracy |
| `/polls` | Fan polls about Texas boxing; users earn TX-Credits per vote |
| `/compare` | Side-by-side fighter comparison (records, stats, KO percentages) |
| `/8count` | "The 8 Count" ringside news feed with dynamic `[slug]` post pages |
| `/checkout` | TXMX Black Card subscription via Stripe |
| `/pledge` | Gym Pledge — fans back a gym for a 16-week season and earn Loyalty Points |
| `/scorecard` | Engagement platform overview and Black Card access info |
| `/riseofachampion` | Rise of a Champion event pages with gallery and RSVP |
| `/admin` | Protected admin dashboard for managing fighters, events, venues, gyms, promoters, props, polls, 8 Count posts, economy config, notifications, and TDLR imports |

### `app/actions/` — Server Actions

Server-side functions for database operations and business logic:

- **fighters.ts** — Fighter CRUD, search, and filtering
- **events.ts** — Event management and bout results
- **users.ts** — User profiles, subscription status, leaderboard queries
- **props.ts** — Prop Picks: open props, pick submission, scoring
- **polls.ts** — Fan poll CRUD, voting, TX-Credit rewards
- **eight-count.ts** — 8 Count post management
- **economy.ts** — TX-Credit & Skill Point economy configuration
- **stripe-subscribe.ts** — Black Card subscription via Stripe
- **daily-login.ts** — Daily login reward tracking
- **credits.ts** — TX-Credit balance management
- **notifications.ts** — Push notification delivery
- **gyms.ts** — Gym data and loyalty tracking
- **venues.ts** — Venue and promoter data
- **tdlr-import.ts** — Import parsed TDLR PDF results into Firestore
- **iconic-series-stripe.ts** — Stripe checkout for sponsorship packages
- **email.ts** — Email delivery via Resend
- **sharing.ts** — Social sharing
- **contact-form.ts** — Contact form submissions

### `app/api/` — API Routes

| Route | Description |
|-------|-------------|
| `/api/admin/upload` | Image upload to Firebase Storage (fighter photos, 8 Count images) |
| `/api/auth/profile` | User profile endpoint |
| `/api/cron/tdlr-boxing` | Scheduled daily cron job to fetch & parse TDLR boxing results |
| `/api/gallery` | Event photo gallery served from Google Drive |
| `/api/gallery-access` | Gallery unlock verification |
| `/api/iconic-series-inquiry` | Rise of a Champion sponsorship inquiries |
| `/api/newsletter` | Newsletter subscription via Resend |
| `/api/stripe/subscribe` | Black Card Stripe checkout session |
| `/api/stripe/webhook` | Stripe webhook handler for billing events |
| `/api/tdlr-parse` | TDLR PDF parsing (Next.js route wrapping the parser) |

### `api/` — Python Serverless Function

`tdlr-parse.py` — Vercel Python serverless endpoint that accepts TDLR (Texas Department of Licensing & Regulation) PDF uploads and returns structured JSON with event metadata and bout results.

### `components/` — Reusable Components

- **Top-level** — `navbar.tsx`, `footer.tsx`, `hero-section.tsx`, `auth-modal.tsx`, `newsletter.tsx`, `fan-polls.tsx`, `daily-login-reward.tsx`, `notification-bell.tsx`, `share-button.tsx`, `subscribe-button.tsx`, `calendar-reminder.tsx`, `slide-out-modal.tsx`
- **gallery/** — Image lightbox and gallery unlock form
- **iconic-series/** — Rise of a Champion sponsorship forms, RSVP, and Stripe checkout
- **icons/** — Custom SVG icons (Instagram, X, YouTube, Mail, etc.)
- **ui/** — Base primitives (`button.tsx`, `input.tsx`)

### `lib/` — Utilities & Configuration

| File | Purpose |
|------|---------|
| `firebase-admin.ts` | Firebase Admin SDK initialization (server-side) |
| `firebase-client.ts` | Firebase client SDK with Google auth |
| `auth-context.tsx` | React context for authentication state |
| `stripe.ts` | Stripe server-side client |
| `google-drive.ts` | Google Drive API integration for event photo galleries |
| `gallery-images.ts` | Fetch gallery images from Google Drive |
| `iconic-series-products.ts` | Sponsorship package definitions |
| `json-ld.ts` | Structured data for SEO (Organization, Event, Breadcrumb) |
| `tdlr-parser.ts` | TDLR PDF text parsing logic |
| `utils.ts` | Utility helpers (`cn()` for classname merging) |
| `types/fighter.ts` | TypeScript interfaces for Fighter, records, titles, locations |

### `scripts/` — Data Scripts

- **tdlr-backfill-settlement.mjs** — Backfill cryptographic settlement hashes on existing Firestore records (`pnpm backfill:tdlr` for dry-run, `pnpm backfill:tdlr:write` to persist)
- **tdlr-batch-import.mjs** — Batch import TDLR results from local JSON files
- **tdlr-extract.py** — Extract fighter/bout data from TDLR PDFs
- **tdlr-scrape-boxing.py** — Scrape boxing data from external sources

### `tdlr-downloads/` — Archived Results

JSON files containing downloaded TDLR boxing event results, named by date and event (e.g., `01-20-24-43339-TMB-SAN-ANTONIO.json`). These serve as the source-of-truth for boxing records imported into the database.

### `docs/`

- **GOOGLE_DRIVE_SETUP.md** — Instructions for configuring Google Drive API access for event photo galleries

---

## Config Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Redirects for `riseofachampion.com`, remote image patterns, BotID |
| `firebase.json` | Firestore database ID (`txmx`) |
| `vercel.json` | Vercel cron: `/api/cron/tdlr-boxing` daily at 12 PM |
| `tsconfig.json` | TypeScript configuration |
| `postcss.config.mjs` | PostCSS / Tailwind CSS setup |
| `eslint.config.mjs` | ESLint configuration |
| `instrumentation-client.ts` | BotID path protection for form endpoints |

---

## Getting Started

### 1. Clone & Install

```sh
git clone <your-repository-url>
cd next-txmx
pnpm install
```

### 2. Environment Variables

Create `.env.local` in the project root. Get the values from the project administrator.

```env
# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=

# Google Drive (for event galleries)
GOOGLE_DRIVE_FOLDER_ID=
```

### 3. Run Development Server

```sh
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Collaboration Workflow

We follow a feature-branch workflow. All work is done on a dedicated branch and merged into `main` via Pull Request.

```sh
# Sync main
git checkout main && git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, commit (conventional commits)
git add .
git commit -m "feat: add fighter comparison stats"

# Push and open PR
git push -u origin feature/your-feature-name
```

After the PR is reviewed and merged, clean up:

```sh
git checkout main
git branch -d feature/your-feature-name
```

You can also delete the remote branch from the GitHub