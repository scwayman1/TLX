# TelemetryX

A mission-control operating system for fleet and asset management.

This repository currently contains a **synthetic-data product foundation** built to validate product direction safely. It is not connected to AssetPro or any production system.

## Included surfaces

- Portfolio mission control and exception queue
- Fleet asset registry with search, filtering, health, and service state
- Asset detail operating timeline
- Work orders and maintenance priorities
- Inspection and compliance workspace
- Parts and inventory workspace
- People, reports, and governance/control surfaces
- Human-in-the-loop agent recommendations
- Responsive desktop/mobile interface

## Run locally

```bash
npm install
npm run dev
```

## Quality gates

```bash
npm run lint
npm test
npm run build
```

## Safety boundary

All displayed organizations, people, assets, costs, and operating records are synthetic. Production integrations, authentication, authorization, persistent storage, and audit-event signing are future implementation work and must be completed before production use.
