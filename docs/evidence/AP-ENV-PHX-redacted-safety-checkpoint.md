# AP-ENV-PHX — Redacted Differential Safety Checkpoint

**Observed:** 2026-08-20 08:56 USMST  
**Version:** AssetPro 1.60.18  
**Comparison baseline:** AP-ENV-DEMO / AssetPro 1.60.10  
**Authorization boundary:** Read-only safety gate only  
**Classification:** STOP-REQUIRED / presumed live-operational or customer-derived  

## Observed, redacted evidence

- Authenticated role: AcgAdmin.
- One customer-identifying tenant/site context was visible and is intentionally omitted.
- Full primary navigation matched the operational Demo surface: Dashboard, Assets, Safety, Maintenance, Tracker, Admin, Reports, and ACG Admin.
- The asset page displayed a small fleet with online/offline states, alarms, named operators, and heartbeat timestamps updated within minutes of observation.
- Command-capable or externally actionable controls were visible: add, export, bulk selection/Functions, per-row edit, messaging/notification icons, and a mounted send-ticket workflow.
- No integration names were visible from the bounded first page.

## Actions not taken

- No record was opened.
- No identifying screenshot is retained in this product-discovery artifact.
- No create/edit/save/delete, export, message, upload, device command, API token, role/user, billing, integration, or configuration action was performed.
- No network payload, session token, or secret was captured.

## Disposition

PHX was classified **STOP-REQUIRED** by backend/DevOps review because recent device heartbeats, named operators, alarms, and command-capable controls exceeded the safe demo boundary. The session was signed out and the PHX tab was closed. Deeper access requires tenant/data-owner confirmation, a narrower written scope, and preferably a true read-only account.
