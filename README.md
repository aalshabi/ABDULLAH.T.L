# سافر بوعي — SafrBwai

**منصة الذكاء الاصطناعي التي تكشف خدع السفر قبل أن تدفع.**
_An AI travel-intelligence platform that exposes hotel, destination and travel-offer tricks before you pay._

Arabic-first (RTL), English-second (LTR). Built to feel premium, load fast, and be SEO-ready.

---

## ✨ Features

- **Home** — premium bilingual landing with hero, stats, features, how-it-works, editorial pillars and CTA.
- **Analyze Hotel** — trust score + red/green flags + metric breakdown (review authenticity, price transparency, photo accuracy, location honesty, hidden fees).
- **Analyze Destination** — safety, best season, cost level, tourist traps and conscious-traveler tips.
- **Analyze Travel Offer** — real-vs-advertised price reveal, hidden costs, transit quality and the catches.
- **Compare Hotels** — up to four hotels side by side with a "best value" winner.
- **Travel Knowledge** — filterable library of practical anti-scam guides.
- **Dashboard** — saved analyses, estimated savings and quick actions (persisted locally).
- **Authentication** — email/password + Google OAuth via Supabase, with a graceful demo mode.

## 🧱 Tech stack

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 15** (App Router, RSC) |
| Language | **TypeScript** (strict) |
| Styling | **Tailwind CSS** + CSS variables |
| Components | **shadcn/ui** (Radix primitives) |
| Auth & data | **Supabase** (`@supabase/ssr`) |
| Animation | Framer Motion + progressive-enhancement CSS |
| Icons | lucide-react · Toasts: sonner · Theme: next-themes |

### Brand

- Navy `#0D1B3A` · Teal `#00A7B6` · White
- Display font: **Tajawal** · Body font: **IBM Plex Sans Arabic** (both cover Arabic + Latin)

## 🚀 Getting started

```bash
npm install
cp .env.example .env.local   # optional — see below
npm run dev                  # http://localhost:3000
```

### Environment variables

The app runs in a fully-functional **demo mode** with no configuration — every
analysis feature works out of the box. To enable real authentication, add a
Supabase project's keys to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

When these are absent, sign-up is disabled and a notice is shown; all other
pages remain fully usable.

## 📜 Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## 🗂️ Structure

```
src/
├── app/                    # routes (home, analyze-*, compare-hotels, knowledge, dashboard, auth)
│   ├── sitemap.ts robots.ts manifest.ts   # SEO
│   └── layout.tsx globals.css
├── components/
│   ├── ui/                 # shadcn primitives
│   ├── layout/             # navbar, footer
│   ├── home/               # landing sections
│   ├── analyzers/          # hotel / destination / offer / compare
│   └── shared/             # logo, score ring, reveal, page header, blocks
├── lib/
│   ├── analysis/engine.ts  # deterministic seeded analysis (swap-in point for a real LLM)
│   ├── i18n/               # ar/en dictionaries + provider
│   ├── supabase/           # browser + server clients
│   └── knowledge.ts storage.ts utils.ts
└── hooks/use-auth.ts
```

## 🔌 Swapping in a real AI backend

`src/lib/analysis/engine.ts` exposes `analyzeHotel`, `analyzeDestination`,
`analyzeOffer` and `compareHotels`. They currently return deterministic,
seeded results so the UX is fully functional offline. Replace their internals
with calls to an LLM + data providers while keeping the same return types — the
UI needs no changes.

## ⚡ Performance & SEO

- Static prerendering for all content pages, `~105 kB` shared JS.
- `metadata`, Open Graph, Twitter cards, JSON-LD, sitemap, robots and PWA manifest.
- Theme-aware (light/dark), responsive, and `prefers-reduced-motion` friendly.

---

© 2026 سافر بوعي · SafrBwai — Abdullah Travel Lab
