# NexEstate

> "The intelligent layer of the real-estate business." LATAM real-estate services agency powered by AI — value layer on top of existing CRMs (Tokko, deinmobiliarios), not a replacement.
> Status: Discovery / MVP (Phase 1).

## Stack
- **Framework:** Next.js 15 (App Router, Turbopack) + React 19 + TypeScript
- **Styling:** Tailwind v4
- **DB:** Supabase (PostgreSQL + SSR)
- **Rate limit:** Upstash Redis
- **Error tracking:** Sentry
- **Analytics:** Vercel Analytics + Speed Insights
- **Validation:** Zod
- **Testing:** Vitest + Playwright + Testing Library
- **Package manager:** npm (package-lock.json)

## GitHub / Supabase
- **GitHub:** `gparrarsw/nexestate` (Company account).
- **Supabase:** Personal (`gparrar0x`) — project ref `vfdvfqqkxvqqcfeejazh`, region `sa-east-1`.
- **Deploy:** Vercel team (SSO-protected, requires auth switch to push).

## Structure
```
nexestate/
├── src/
│   ├── app/              # App Router pages
│   ├── components/
│   ├── lib/
│   ├── types/
│   ├── middleware.ts
│   ├── instrumentation.ts          # Sentry init (server)
│   └── instrumentation-client.ts   # Sentry init (browser)
├── supabase/             # migrations
├── config/
├── docs/                 # ADRs, design notes
├── assets/               # source files
├── public/               # served
├── backlog/              # issue specs (pre-Linear)
├── BACKLOG.md
├── MASTERPLAN.md         # strategic roadmap
├── PRD.md                # product requirements
├── ARCH.md               # architecture
├── METRICS.md            # KPIs
├── BRAND_HANDOFF.md
├── PRODUCT_IDENTITY.md   # brand source of truth (project-local)
└── vercel.json
```

## Commands
```bash
npm run dev              # localhost:3000 (turbopack)
npm run build            # prod build
npm run start            # prod serve
npm run lint             # biome check
npm run lint:fix         # biome auto-fix
npm run format           # biome format
npm run type-check       # tsc --noEmit
npm run test             # vitest
npm run test:ui          # vitest UI
npm run test:e2e         # playwright
```

## Conventions
- **Biome** for lint + format.
- **Project-local design tokens** — `src/app/globals.css` + **project** PRODUCT_IDENTITY.md (not the global Skywalking palette).
- **Zod** validation in API routes + forms.
- **data-testid** mandatory on interactive elements.
- **Sentry** configured for client + server + edge via `@sentry/nextjs`.
- **Rate limit** via Upstash for sensitive endpoints.

## Docs
- `@PRD.md` — problem + value proposition + services architecture (5 levels).
- `@ARCH.md` — technical architecture.
- `@MASTERPLAN.md` — roadmap.
- `@METRICS.md` — KPIs.
- `@PRODUCT_IDENTITY.md` — brand (project-local).

## Env
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SENTRY_DSN=
```
