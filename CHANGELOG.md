# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- PRD con definicion de producto, propuesta de valor, y arquitectura de servicios (5 niveles)
- ARCH.md con stack tecnologico, schema de DB, y API routes
- BACKLOG.md con breakdown tecnico: 8 tickets Fase 1, 5 tickets Fase 2, 5 tickets Fase 3
- METRICS.md con KPIs por fase y metricas de producto
- Validacion de Tokko API: 17 endpoints disponibles, auth por API key
- Research de naming (Oraculo): top 3 candidatos (Leva, Veloz, Estela)

### Changed

- Stack: FastAPI → Next.js full-stack (Vercel). Jobs pesados → n8n
- PRD: redistribucion de niveles (match+scoring → MVP, video+mapas → Fase 2)
- Backlog: F1-05 ahora es match+scoring (antes era dashboard). Placeholders "Proximamente" en dashboard
- DB schema: tablas `lead_scores` y `contact_matches` agregadas al MVP
