# TelemetryX product scope

## Operating model

TelemetryX is organized around an operating loop rather than disconnected records:

1. **Sense** asset state, inspections, usage, costs, and exceptions.
2. **Prioritize** work by safety, client impact, operational risk, and timing.
3. **Decide** with a named human owner for consequential actions.
4. **Execute** through work orders, parts, assignments, and evidence.
5. **Verify** return-to-service and preserve an auditable timeline.

## Product domains

- Mission control: portfolio health, priority queue, decisions, agent briefs
- Assets: registry, assignment, location, meters, lifecycle, documents, history
- Maintenance: requests, work orders, preventive schedules, labor, costs, approvals
- Inspections: templates, submissions, evidence, defects, corrective action
- Parts and inventory: catalog, stock, reservations, purchasing, receiving, valuation
- People: operators, technicians, teams, certifications, accountability
- Reporting: availability, spend, utilization, compliance, lifecycle forecasts
- Controls: role boundaries, approval policy, audit events, data-quality review

## Implemented vertical slice

- Synthetic portfolio mission control
- Searchable and filterable fleet registry
- Asset health, service state, and operating timeline
- Maintenance priority queue and work-order table
- Domain workspaces for inspections, inventory, people, reports, and controls
- Human-in-the-loop approval interactions
- Command palette, notifications, responsive navigation, and mobile layout

## Explicit production gaps

- Identity, SSO, RBAC, tenant isolation, and row-level authorization
- Durable database, migrations, backup, restore, and retention
- Signed/immutable audit events and approval-policy enforcement
- AssetPro import contract and reconciled migration tooling
- Telematics, fuel-card, accounting, procurement, and document integrations
- Real reports, background jobs, tracing, metrics, alerts, and production operations
- Accessibility audit, browser matrix, load testing, threat model, and penetration test

The current application is a product foundation, not a production asset system.

## Quality review baseline

Production release remains blocked until integrity, authorization, accessibility, observability, and deployment-safety gates are evidenced. In particular: use integer minor units or decimals for money; enforce tenant scope server-side; make mutations idempotent and transactional; preserve actor-attributed audit events; complete keyboard, screen-reader, zoom, responsive-width, and axe reviews; expose build identity and safe structured diagnostics; and prohibit live credentials, targets, or seed operations until explicitly authorized.
