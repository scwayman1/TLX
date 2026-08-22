# AP-ENV-KENCO — Redacted Differential Safety Checkpoint

**Observed:** 2026-08-20 08:56 USMST  
**URL class:** HTTPS on port 8443; no TLS/certificate warning observed  
**Branding/version:** FleetCloud-branded AssetPro 1.60.18  
**Comparison baseline:** AP-ENV-DEMO / AssetPro 1.60.10  
**Authorization boundary:** Read-only safety gate only  
**Classification:** STOP-REQUIRED / presumed customer-derived; signed out and closed  

## Observed, redacted evidence

- Authenticated role: AcgAdmin.
- Tenant/site context was visible but is intentionally omitted.
- Full primary navigation matched the operational surface: Dashboard, Assets, Safety, Maintenance, Tracker, Admin, Reports, and ACG Admin.
- A nonzero fleet inventory was visible; the exact count is intentionally omitted.
- Visible asset-state evidence included out-of-range device rows.
- Historical device-heartbeat samples were visible; exact dates and activity details are intentionally omitted. Their presence establishes that device-state data exists but does not establish whether operations are currently live.
- Command-capable or externally actionable controls were visible: add, export, Functions, per-row edit, send-ticket, messaging, and notifications.
- No integration name was inspected because deeper navigation is paused at the safety gate.

## Actions not taken

- No record was opened.
- No identifying screenshot is retained in this product-discovery artifact.
- No create/edit/save/delete, export, message, upload, device command, API token, role/user, billing, integration, configuration, or scheduled-report action was performed.
- No network payload, session token, or secret was captured.

## Disposition

Kenco was classified **STOP-REQUIRED / presumed customer-derived** by backend/DevOps review. Retained device-state data, AcgAdmin access, and externally actionable controls exceeded the safe assessment boundary even though visible heartbeat samples were older than PHX. The session was signed out and the Kenco tab was closed. Deeper access requires tenant/data-owner authorization, a narrowly bounded scope, and preferably a true read-only account.
