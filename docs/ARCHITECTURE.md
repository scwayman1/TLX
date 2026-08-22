# Architecture

## Current

- React + TypeScript + Vite
- CSS design system with responsive application shell
- Local typed synthetic fixtures
- Vitest + Testing Library for critical interaction coverage
- Oxlint, TypeScript build, and npm audit quality gates

## Evolution path

Evolve this into a modular monolith before any service split:

- Web: React application organized by product domain
- API: typed application services with tenant and authorization context at every boundary
- Data: PostgreSQL with append-only audit events and explicit effective timestamps
- Jobs: durable queue for imports, integrations, reports, and notifications
- Files: object storage with malware scanning, content hashes, and retention policy
- Identity: enterprise OIDC/SSO, MFA policy, and least-privilege RBAC
- Observability: structured logs, traces, domain metrics, and SLO-backed alerts

## Core integrity rules

- Assets have stable internal IDs; external source IDs are mappings, never primary identity.
- Meter readings are timestamped, sourced, validated, and correction-audited.
- Work-order state transitions are explicit and actor-attributed.
- Costs preserve currency, quantity, unit price, tax, and approval provenance.
- Inspections preserve template version and submitted evidence.
- Consequential agent recommendations require human approval and create an audit event.
- Synthetic, demo, and production data are visually and operationally separated.
