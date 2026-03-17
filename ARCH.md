# Arquitectura — NexEstate

## Overview

```
┌──────────────────────────────────────────────────┐
│            Next.js 15 (Vercel)                   │
│                                                  │
│  App Router                                      │
│  ├── Dashboard (RSC + client)                    │
│  ├── Landings publicas (SSR + Edge)              │
│  ├── Chat IA (streaming)                         │
│  ├── Marketing site (SSG)                        │
│  └── API Routes (/api/*)                         │
│       ├── Auth, Properties, Contacts             │
│       ├── Landings, Chat, Billing                │
│       └── CRM connect, Dashboard stats           │
└──────┬──────┬──────┬──────┬──────┬───────────────┘
       │      │      │      │      │
       ▼      ▼      ▼      ▼      ▼
  Supabase  Tokko  OpenAI  MercadoPago  Upstash
  (PG+Auth) (CRM)  (LLM)  (Payments)   (Redis)
  +Storage         +AI SDK

┌──────────────────────────────────────────────────┐
│            n8n (self-hosted)                      │
│  ├── CRM sync programado (cada 1h)               │
│  ├── Embeddings rebuild post-sync                 │
│  ├── Remarketing sequences (Fase 2)              │
│  └── Webhooks pesados / bulk operations           │
└──────────────────────────────────────────────────┘
```

## Stack

| Capa | Tech | Justificacion |
|------|------|---------------|
| Full-stack | Next.js 15 (App Router) | SSR landings, RSC dashboard, API routes, un solo deploy |
| DB | PostgreSQL (Supabase) | RLS nativo, auth incluido, pgvector para RAG |
| Cache | Redis (Upstash) | Rate limiting, cache de sync, sesiones. Serverless-compatible |
| Auth | Supabase Auth | Magic link, multi-tenant con RLS |
| Storage | Supabase Storage | Fotos/media de propiedades |
| LLM | OpenAI API + Vercel AI SDK | GPT-4o para chat, streaming nativo, embeddings para RAG |
| Payments | MercadoPago | LATAM native, suscripciones recurrentes |
| Deploy | Vercel | Edge functions, preview deployments, cron jobs |
| Automation | n8n (self-hosted) | Sync CRM pesado, workflows, bulk operations |
| Maps | Mapbox GL JS | Customizable, buen free tier (Fase 2) |
| Video | HeyGen / RunwayML API | Generacion de reels desde fotos (Fase 2) |
| Monitoring | Sentry + Vercel Analytics | Errors + performance |

### Por que Next.js full-stack (no FastAPI separado)
- Un solo deploy, un solo stack (TypeScript everywhere)
- Sin costo extra de Railway/Render
- Vercel AI SDK: streaming chat, tool calling, embeddings nativo
- Edge Functions para landings publicas (baja latencia global)
- API Routes del App Router son suficientes para CRUD + webhooks
- Jobs pesados (CRM sync, bulk embeddings) → n8n, no Vercel

## Base de datos (schema core)

```sql
-- Multi-tenant
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tier TEXT DEFAULT 'starter', -- starter/pro/enterprise
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT DEFAULT 'agent', -- admin/agent
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CRM Integration
CREATE TABLE crm_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  provider TEXT NOT NULL, -- 'tokko', 'deinmobiliarios'
  api_key_encrypted BYTEA NOT NULL,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Properties (normalized from CRM)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  external_id TEXT, -- ID en el CRM
  crm_connection_id UUID REFERENCES crm_connections(id),
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT, -- casa, depto, terreno, etc.
  operation_type TEXT, -- venta, alquiler, temporal
  price DECIMAL,
  currency TEXT DEFAULT 'USD',
  address TEXT,
  location JSONB, -- {lat, lng, city, state, country}
  specs JSONB, -- {rooms, bathrooms, surface_total, surface_covered, ...}
  tags TEXT[],
  media JSONB, -- [{type, url, order}]
  status TEXT DEFAULT 'active',
  raw_data JSONB, -- datos originales del CRM
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contacts (normalized from CRM)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  external_id TEXT,
  crm_connection_id UUID REFERENCES crm_connections(id),
  name TEXT,
  email TEXT,
  phone TEXT,
  tags TEXT[],
  preferences JSONB, -- {property_types, locations, budget_range}
  raw_data JSONB,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Landings
CREATE TABLE landings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  property_id UUID REFERENCES properties(id),
  template_id TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  config JSONB DEFAULT '{}', -- customizaciones
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE landing_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_id UUID REFERENCES landings(id),
  contact_data JSONB NOT NULL,
  synced_to_crm BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE landing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_id UUID REFERENCES landings(id),
  event_type TEXT NOT NULL, -- 'view', 'form_open', 'submission', 'map_interact'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat IA
CREATE TABLE property_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  org_id UUID REFERENCES organizations(id),
  chunk_text TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Billing
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) UNIQUE,
  tier TEXT NOT NULL DEFAULT 'starter',
  mp_subscription_id TEXT,
  status TEXT DEFAULT 'active', -- active, past_due, cancelled
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lead scoring (MVP)
CREATE TABLE lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  contact_id UUID REFERENCES contacts(id),
  property_id UUID REFERENCES properties(id),
  score DECIMAL DEFAULT 0, -- 0-100
  signals JSONB DEFAULT '{}', -- {landing_time, form_opens, map_interactions, ...}
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contact-Property match (MVP)
CREATE TABLE contact_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  contact_id UUID REFERENCES contacts(id),
  property_id UUID REFERENCES properties(id),
  match_score DECIMAL DEFAULT 0, -- 0-100
  match_reasons JSONB DEFAULT '{}', -- {location, budget, type, ...}
  status TEXT DEFAULT 'suggested', -- suggested, contacted, dismissed
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: todas las tablas con org_id filtran por org del usuario
```

## API Routes (Next.js App Router)

```
# Auth
POST   /api/auth/register
POST   /api/auth/invite
GET    /api/auth/me

# Organization
GET    /api/org
PATCH  /api/org
GET    /api/org/members

# CRM Connections
POST   /api/crm/connect          # {provider, api_key}
POST   /api/crm/sync             # trigger manual sync (calls n8n webhook)
GET    /api/crm/status

# Properties
GET    /api/properties            # ?search, ?type, ?operation, ?page
GET    /api/properties/:id
GET    /api/properties/:id/matches  # contactos sugeridos

# Contacts
GET    /api/contacts              # ?search, ?tags, ?page
GET    /api/contacts/:id
GET    /api/contacts/:id/scores   # lead scores

# Landings
GET    /api/landings
POST   /api/landings              # {property_id, template_id}
PATCH  /api/landings/:id          # {config, published}
GET    /api/landings/:id/analytics
POST   /api/landings/:id/submit   # public endpoint for form (Edge)

# Chat (Vercel AI SDK streaming)
POST   /api/chat                  # {message, session_id?} → streaming response
GET    /api/chat/sessions
POST   /api/chat/export-pdf       # {property_id}

# Billing
GET    /api/billing/plans
POST   /api/billing/subscribe     # {tier} → MP checkout URL
POST   /api/billing/webhook       # MercadoPago IPN
GET    /api/billing/status

# Dashboard
GET    /api/dashboard/stats       # KPIs aggregados

# n8n triggers (internal)
POST   /api/internal/sync-complete  # n8n notifica sync terminado
POST   /api/internal/rebuild-embeddings  # trigger post-sync
```

## Seguridad

- API keys de CRMs: AES-256 encryption at rest (via Supabase Vault o crypto nativo)
- Auth: Supabase JWT + RLS
- Rate limiting: Upstash Redis per org
- CORS: whitelist de dominios
- Input validation: Zod schemas
- Landings publicas: rate limit en form submissions (anti-spam)
- Internal endpoints: shared secret header validation
