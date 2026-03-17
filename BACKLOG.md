# Backlog — NexEstate

> Breakdown tecnico por fases. Cada ticket tiene agentes asignados y dependencias.
> Estado: `[ ]` pending `[~]` in progress `[x]` done
> Stack: Next.js 15 full-stack (Vercel) + Supabase + n8n

---

## Fase 0 — Fundacion

### F0-01: Identidad de marca y nombre definitivo
- **Agentes:** Aurora
- **Scope:** Naming final, logo, paleta, tipografia, brand guidelines
- **Entregables:** `docs/PRODUCT_IDENTITY.md`, assets en `/brand`
- **Deps:** Resultado de research Oraculo (naming + dominios)
- **Estado:** [ ]

### F0-02: Setup repositorio Next.js
- **Agentes:** Kokoro, Hermes
- **Scope:** Next.js 15 App Router, Supabase client, Vercel AI SDK, pnpm.
- **Entregables:**
  ```
  nexestate/
  ├── app/
  │   ├── (auth)/         # login, register, invite
  │   ├── (dashboard)/    # dashboard, properties, landings, chat, settings
  │   ├── (marketing)/    # landing page publica del producto
  │   ├── l/[slug]/       # landings publicas de propiedades
  │   └── api/            # route handlers
  ├── components/
  ├── lib/                # supabase client, tokko client, utils
  ├── supabase/           # migrations, seeds
  ├── docs/
  └── package.json
  ```
- **Deps:** F0-01 (nombre para naming del repo)
- **Estado:** [ ]

### F0-03: Dominio + DNS + Vercel project
- **Agentes:** Hermes
- **Scope:** Comprar dominio, configurar DNS, crear proyecto Vercel, env vars base
- **Deps:** F0-01
- **Estado:** [ ]

---

## Fase 1 — MVP (Nivel 1 plataforma)

### F1-01: Auth + multi-tenant
- **Agentes:** Kokoro
- **Scope:**
  - Supabase Auth (email + magic link)
  - Tabla `organizations` (inmobiliaria/desarrolladora)
  - Tabla `members` (usuarios por org, roles: admin/agent)
  - RLS policies por org
  - API key storage para CRMs externos (encriptado)
  - Middleware de Next.js para proteger rutas
- **AC (EARS):**
  - [ ] WHEN un usuario se registra THE SYSTEM SHALL crear una organizacion y asignarlo como admin
  - [ ] WHEN un admin invita un miembro THE SYSTEM SHALL enviar magic link y asignar rol
  - [ ] THE SYSTEM SHALL aislar datos entre organizaciones via RLS
  - [ ] THE SYSTEM SHALL almacenar API keys de CRMs externos con encriptacion AES-256
- **Deps:** F0-02
- **Estado:** [ ]

### F1-02: Conector Tokko CRM
- **Agentes:** Kokoro (lib/tokko client), Flux (n8n workflow)
- **Scope:**
  - `lib/tokko.ts` — cliente tipado para Tokko API
  - API route `/api/crm/connect` — validar key + trigger sync inicial
  - n8n workflow para sync programado (cada 1h): pull properties, contacts, media
  - Mapeo de modelos Tokko → schema interno
  - Sync de fotos/media a Supabase Storage
  - Tablas: `crm_connections`, `properties`, `contacts`
  - API route `/api/internal/sync-complete` — n8n notifica fin de sync
- **AC (EARS):**
  - [ ] WHEN una org conecta su API key de Tokko THE SYSTEM SHALL validar la conexion y ejecutar sync inicial
  - [ ] WHEN se ejecuta un sync THE SYSTEM SHALL importar propiedades, contactos y media actualizados
  - [ ] IF una propiedad fue eliminada en Tokko THE SYSTEM SHALL marcarla como inactiva (soft delete)
  - [ ] THE SYSTEM SHALL normalizar datos de Tokko al schema interno sin perder atributos custom
  - [ ] WHILE un sync esta en progreso THE SYSTEM SHALL mostrar estado al usuario
- **Deps:** F1-01
- **Estado:** [ ]

### F1-03: Generador de landings por propiedad
- **Agentes:** Aurora (design), Pixel (frontend), Sentinela (QA)
- **Scope:**
  - Route group `app/l/[slug]/` — landing publica SSR (Edge runtime)
  - Template system con 3-5 disenos base (React components)
  - Auto-populate desde datos de propiedad (fotos, specs, ubicacion, precio)
  - Formulario de contacto trackeable → `/api/landings/:id/submit` → webhook CRM
  - Editor basico en dashboard (toggle secciones, cambiar template, personalizar colores)
  - Analytics: `/api/landings/:id/analytics` + Vercel Analytics
  - Tablas: `landings`, `landing_analytics`, `landing_submissions`
- **AC (EARS):**
  - [ ] WHEN un usuario selecciona una propiedad THE SYSTEM SHALL generar una landing con datos auto-poblados en <30s
  - [ ] THE SYSTEM SHALL proveer al menos 3 templates de diseno profesional
  - [ ] WHEN un visitante completa el formulario THE SYSTEM SHALL enviar el lead al CRM via webhook
  - [ ] THE SYSTEM SHALL generar una URL publica unica por landing
  - [ ] THE SYSTEM SHALL trackear views, submissions y tiempo en pagina por landing
- **Deps:** F1-02 (necesita propiedades sync), Aurora specs
- **Estado:** [ ]

### F1-04: Chat IA (consulta de propiedades)
- **Agentes:** Kokoro (RAG + API), Pixel (UI)
- **Scope:**
  - Vercel AI SDK con `useChat` hook (streaming nativo)
  - RAG: pgvector embeddings sobre propiedades de la org
  - n8n workflow post-sync: rebuild embeddings para propiedades actualizadas
  - Respuestas con links a propiedades, datos clave inline
  - Generacion de fichas PDF on-the-fly (`/api/chat/export-pdf`)
  - Tablas: `property_embeddings`, `chat_sessions`
- **AC (EARS):**
  - [ ] WHEN un usuario hace una pregunta THE SYSTEM SHALL buscar en propiedades de su org y responder en <5s
  - [ ] WHEN el chat menciona una propiedad THE SYSTEM SHALL incluir link y datos clave
  - [ ] WHEN un usuario pide una ficha THE SYSTEM SHALL generar un PDF descargable con datos de la propiedad
  - [ ] THE SYSTEM SHALL mantener contexto de conversacion dentro de la sesion
- **Deps:** F1-02 (propiedades indexadas)
- **Estado:** [ ]

### F1-05: Match inteligente de contactos + Scoring de leads
- **Agentes:** Kokoro
- **Scope:**
  - Match contacto-propiedad basado en: preferencias declaradas, historial, ubicacion, presupuesto
  - Scoring de leads por comportamiento en landing (tiempo, form opens, interacciones)
  - API routes: `/api/properties/:id/matches`, `/api/contacts/:id/scores`
  - Tablas: `contact_matches`, `lead_scores`
  - Algoritmo simple primero (reglas + pesos), ML despues
- **AC (EARS):**
  - [ ] WHEN se sincroniza una propiedad THE SYSTEM SHALL calcular matches con contactos existentes
  - [ ] WHEN un lead interactua con una landing THE SYSTEM SHALL actualizar su score en tiempo real
  - [ ] THE SYSTEM SHALL rankear contactos por probabilidad de interes (score 0-100)
  - [ ] THE SYSTEM SHALL proveer razones del match (ubicacion, presupuesto, tipo)
- **Deps:** F1-02, F1-03
- **Estado:** [ ]

### F1-06: Dashboard principal
- **Agentes:** Aurora (design specs), Pixel (build)
- **Scope:**
  - Layout con navegacion: Dashboard / Propiedades / Landings / Chat / Settings
  - Overview: propiedades sincronizadas, landings activas, leads recientes, top matches
  - Metricas: views totales, submissions, conversion rate, lead scores
  - Actividad reciente (timeline)
  - Settings de org (CRM connection, miembros, billing)
  - Placeholders con "Proximamente" para: Video/Reels, Mapas interactivos, Campanas, Remarketing, Contenido IA
- **AC (EARS):**
  - [ ] WHEN un usuario ingresa al dashboard THE SYSTEM SHALL mostrar KPIs actualizados en <3s
  - [ ] THE SYSTEM SHALL mostrar propiedades sincronizadas con estado de sync
  - [ ] THE SYSTEM SHALL mostrar landings con metricas de rendimiento
  - [ ] THE SYSTEM SHALL mostrar secciones placeholder para funcionalidades futuras (Nivel 2+)
- **Deps:** F1-01, F1-02, F1-03, F1-05
- **Estado:** [ ]

### F1-07: Landing page del producto (marketing site)
- **Agentes:** Aurora (design), Pixel (build), Lumen (SEO), Hermes (deploy)
- **Scope:**
  - Route group `app/(marketing)/` — SSG
  - Hero, features por nivel, pricing (3 tiers), CTA
  - Blog/recursos (SEO play)
  - Formulario de registro / waitlist
  - Optimizado para conversion
- **AC (EARS):**
  - [ ] THE SYSTEM SHALL cargar en <2s (LCP) en mobile
  - [ ] THE SYSTEM SHALL incluir schema markup para SaaS product
  - [ ] WHEN un visitante completa el formulario THE SYSTEM SHALL crear cuenta o agregar a waitlist
- **Deps:** F0-01 (brand), F0-03 (dominio)
- **Estado:** [ ]

### F1-08: Billing + suscripciones
- **Agentes:** Kokoro
- **Scope:**
  - Integracion MercadoPago (suscripciones recurrentes)
  - 3 tiers: Starter / Pro / Enterprise
  - Feature flags por tier (middleware check)
  - Tabla `subscriptions`
  - Webhook handler `/api/billing/webhook` para eventos de pago (IPN)
- **AC (EARS):**
  - [ ] WHEN una org selecciona un plan THE SYSTEM SHALL redirigir a MercadoPago checkout
  - [ ] WHEN MercadoPago confirma pago THE SYSTEM SHALL activar el tier correspondiente
  - [ ] IF una suscripcion falla THE SYSTEM SHALL notificar al admin y dar periodo de gracia de 7 dias
  - [ ] THE SYSTEM SHALL restringir features segun tier activo
- **Deps:** F1-01
- **Estado:** [ ]

---

## Fase 2 — Crecimiento (post-validacion)

### F2-01: Generador de video/reels
- **Agentes:** Kokoro (API integration), Pixel (UI)
- **Scope:** Fotos de propiedad → video con voz IA, musica, textos. Integracion RunwayML/HeyGen.
- **Deps:** F1-02
- **Estado:** [ ]

### F2-02: Mapas interactivos enriquecidos
- **Agentes:** Pixel, Kokoro
- **Scope:** Mapbox + POIs cercanos, distancias, indices de seguridad, valorizacion.
- **Deps:** F1-02
- **Estado:** [ ]

### F2-03: Campanas personalizadas (Meta/Google)
- **Agentes:** Kokoro, Flux, Pregon
- **Scope:** Creacion automatizada de campanas por propiedad. Integracion Meta Ads API + Google Ads API.
- **Deps:** F1-03, F1-05
- **Estado:** [ ]

### F2-04: Remarketing inteligente
- **Agentes:** Flux, Kokoro
- **Scope:** Secuencias automatizadas para leads que no convirtieron.
- **Deps:** F1-05, F2-03
- **Estado:** [ ]

### F2-05: Contenido IA automatico
- **Agentes:** Kokoro, Pregon
- **Scope:** Calendarios de contenido, copy para portales/redes, piezas graficas desde datos CRM.
- **Deps:** F1-02
- **Estado:** [ ]

---

## Fase 3 — Expansion

### F3-01: Integracion deinmobiliarios
- **Agentes:** Kokoro
- **Scope:** Segundo conector CRM. Misma arquitectura que F1-02.
- **Estado:** [ ]

### F3-02: Consultoria digital (modulo)
- **Agentes:** Kokoro, Pixel
- **Scope:** Diagnostico automatizado de operacion digital del cliente.
- **Estado:** [ ]

### F3-03: Capacitacion en IA (plataforma)
- **Agentes:** Pixel, Kokoro
- **Scope:** Modulo de cursos/talleres internos.
- **Estado:** [ ]

### F3-04: Desarrollo web como servicio
- **Agentes:** Pixel, Kokoro, Aurora
- **Scope:** Templates de sitios inmobiliarios white-label.
- **Estado:** [ ]

### F3-05: Expansion regional LATAM
- **Agentes:** Pregon, Oraculo
- **Scope:** Research de mercados, adaptacion, alianzas con CRMs locales.
- **Estado:** [ ]

---

## Dependencias criticas (grafo)

```
F0-01 (brand) ──→ F0-02 (repo) ──→ F1-01 (auth)
                   F0-03 (dominio)      │
                                         ├──→ F1-02 (tokko) ──→ F1-03 (landings) ──→ F1-05 (match+score)
                                         │                   └──→ F1-04 (chat)           │
                                         │                                                ▼
                                         ├──→ F1-08 (billing)                      F1-06 (dashboard)
                                         │
F0-01 ──→ F1-07 (marketing site)
```

## Prioridad de ejecucion MVP

1. F0-01 → F0-02 → F0-03 (paralelo)
2. F1-01 (auth)
3. F1-02 (tokko connector) — **critico, sin esto no hay producto**
4. F1-03 (landings) + F1-04 (chat) — paralelo
5. F1-05 (match + scoring)
6. F1-06 (dashboard) — integra todo
7. F1-07 (marketing site) — puede arrancar en paralelo desde paso 1
8. F1-08 (billing) — puede arrancar despues de auth
