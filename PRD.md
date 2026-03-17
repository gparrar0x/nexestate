# PRD — NexEstate (nombre provisional)

> "La capa inteligente del negocio inmobiliario."
> Estado: Discovery / Fase 1 — MVP

## Problema

Inmobiliarias y desarrolladoras en LATAM:
- Subutilizan datos de sus CRMs (Tokko, deinmobiliarios)
- Contenido lento, caro y generico
- Leads sin calificar (volumen sin calidad)
- Agencias de marketing que no entienden el rubro
- Sin acceso practico a herramientas de IA

## Solucion

Agencia de servicios inmobiliarios potenciada por IA que funciona como **capa de valor agregado** sobre sistemas existentes. No reemplaza herramientas: las amplifica.

**No es:** un CRM, una inmobiliaria, solo software.
**Es:** ecosistema de servicios + tecnologia + acompanamiento.

## Propuesta de valor

| vs. Agencia tradicional | vs. CRM actual | NexEstate |
|---|---|---|
| Contenido generico | Almacena datos | Transforma datos en acciones |
| No entiende el CRM | No genera contenido | Conecta CRM + contenido + IA |
| Cobra por pieza | Cobra por licencia | Cobra por resultado y acceso |
| Proceso lento | Solo organiza | Automatiza y acelera |

## Pilares de diferenciacion

1. **Nativo del rubro** — pensado para inmobiliarias, no adaptado
2. **No reemplaza, potencia** — se conecta a Tokko, deinmobiliarios, etc.
3. **Resultado tangible** — cada servicio tiene entregable medible
4. **Hibrido tech + humano** — IA + equipo que acompana

## Arquitectura de servicios (5 niveles)

### Nivel 1 — Plataforma (core) *← MVP*
- Generador de landings por propiedad (datos CRM → landing profesional)
- Chat IA interno (consulta propiedades en lenguaje natural)
- Match inteligente de contactos (scoring por probabilidad de interes)
- Scoring de leads (comportamiento en landing)
- Dashboard de actividad
- Armar los placeholders de las siguientes funcionalidades con un Proximamente

### Nivel 2 — Marketing con IA
- Generador de video/reels (fotos → video con voz IA)
- Mapas interactivos enriquecidos (POIs, seguridad, valorizacion)
- Campanas personalizadas por propiedad (Meta, Google, portales)
- Remarketing inteligente

### Nivel 3 — Contenido IA
- Calendarios de contenido generados
- Piezas graficas/videos automaticos desde CRM
- Copy optimizado con tono de marca

### Nivel 4 — Consultoria y capacitacion
- Diagnostico de operacion digital
- Integracion de CRMs
- Capacitacion en IA
- Seguimiento mensual

### Nivel 5 — Desarrollo web integral
- Sitios web inmobiliarios integrados con CRM
- Landings custom para desarrollos
- Integraciones tecnicas (Meta Pixel, GA4, HubSpot)

## Publico objetivo

**Primario:**
- Inmobiliarias medianas (5-30 agentes) con CRM subutilizado
- Desarrolladoras que lanzan emprendimientos

**Secundario:**
- Inmobiliarias chicas (1-5 agentes)
- Brokers independientes

## Modelo de negocio

| Canal | Formato | Fase |
|---|---|---|
| Plataforma | Suscripcion mensual (tiers) | MVP |
| Marketing | Fee + % inversion publicitaria | Fase 2 |
| Contenido | Paquetes mensuales | Fase 2 |
| Consultoria | Por hora o paquete | Fase 3 |
| Desarrollo | Proyecto cerrado | Fase 3 |

**Pagos:** MercadoPago (LATAM focus)

## Stack tecnologico

| Componente | Tecnologia |
|---|---|
| Frontend | Next.js / React |
| Backend / API | Python (FastAPI) |
| Base de datos | PostgreSQL + Redis |
| IA / LLM | OpenAI API + modelos especializados |
| Generacion de video | RunwayML / HeyGen / Synthesia API |
| Mapas | Mapbox o Google Maps Platform |
| Integracion CRM | Tokko API, deinmobiliarios |
| Hosting | Vercel (frontend) + AWS (backend) |
| Pagos | MercadoPago |

## Tokko API (validado)

**Auth:** API Key por agencia
**Endpoints disponibles:**
- `/properties` — listings completos
- `/contact` — directorio de contactos
- `/web_contact` — formularios web
- `/developments` — desarrollos/proyectos
- `/locations`, `/states`, `/countries` — geo
- `/property_tags`, `/property_custom_tags` — clasificacion
- `/property_type`, `/development_type` — tipos
- `/branch` — sucursales
- `/user` — usuarios
- `/signed_operations` — operaciones firmadas
- `/inactiveproperty` — propiedades inactivas
- `/deletedcontact` — contactos eliminados

**Metodos:** GET, POST, PUT
**Playground:** tokkobroker.com/api/playground
**Requisito:** Cumplir 4 condiciones para obtener API key (contacto soporte, links por agencia, links por propiedad, integracion formulario contacto)

## KPIs iniciales

- Inmobiliarias conectadas
- Landings/videos generados por mes
- Leads PLUS entregados vs leads tradicionales
- MRR
- NPS clientes activos
- CAC

## Riesgos

| Riesgo | Mitigacion |
|---|---|
| CRMs cierren APIs | Diversificar + valor mas alla del CRM |
| CRMs incorporen IA propia | Nuestro valor = especializacion + servicio |
| Adopcion lenta | Tier gratuito + ROI con casos reales |
| Costos altos de IA | Optimizar tokens, modelos economicos, cache |
| Competencia directa | Combo plataforma + servicios + acompanamiento |
