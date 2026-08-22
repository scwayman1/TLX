# AssetPro Demo Product Map — Checkpoint 2

**Environment:** AP-ENV-DEMO (`https://demoweb.assetpro360.com/`)  
**Legacy version observed:** AssetPro 1.60.10  
**Observed:** 2026-08-19 21:50 USMST  
**Account context:** AcgAdmin  
**Selected demo context:** TelemetryX → Phoenix  
**Authorization:** User-confirmed demo data; deep exploration authorized. External communications, billing triggers, authentication/security changes, shared-data deletion, irreversible actions, and bulk actions excluded without separate approval.

> Coverage status: **In progress.** This document maps the verified AcgAdmin capability ceiling for one company/site context. It does not establish the baseline experience for lower-privilege users and is not a claim of complete legacy-product coverage.

## Evidence labels

- **Observed:** Directly verified in the authenticated running product.
- **Inferred:** Reasoned interpretation that still requires corroboration.
- **Unknown:** Material question not yet verified.
- **Preliminary decision:** Early Asset Pro direction; not approved product scope.

## Global product shell

### AP-LEG-NAV-001 — Context-sensitive navigation

**Observed**

- Global selectors: company, site, and (where relevant) date period.
- Company/site context materially changes visible navigation and loaded data.
- With `ABC Test / All Sites`, the shell exposed Dashboard, Safety, Admin, and ACG Admin; the dashboard reported no assigned product.
- With `TelemetryX / Phoenix`, the shell exposed Dashboard, Assets, Safety, Maintenance, Tracker, Admin, Reports, ACG Admin, and Sign Out.
- Global utility surfaces include profile editing, help-ticket creation, notifications, and messaging.
- Help-ticket fields include company, site, username, type, subject, description, asset type, asset(s), frequency, priority, customer details, operators, and attachment.

**Impact:** Entitlements appear to be a combination of role, company, site, service, and product assignment—not role alone.

**Preliminary decision:** **Improve/Combine.** Preserve context switching and entitlement-driven navigation, but model entitlements explicitly and make restricted/unavailable states understandable.

## Roles and permissions

### AP-LEG-ROLE-001 — Role catalog

**Observed**

Profile role selector values:

- AcgAdmin
- CompanyAdmin
- SiteAdmin
- FleetSupervisor
- HRAdmin
- Maintenance

Role-access configuration labels:

- ACG Admin
- Corporate Admin
- Site Admin
- Supervisor
- Maintenance Admin

**Finding:** The product uses inconsistent labels for apparently related roles (for example, CompanyAdmin vs Corporate Admin, FleetSupervisor vs Supervisor, Maintenance vs Maintenance Admin).

### AP-LEG-ROLE-002 — Verified top-level access matrix

**Observed from disabled/read-only role-access checkboxes**

| Role-access label | Dashboard | Assets | Safety | Maintenance | Tracker | Admin | Reports | ACG Admin | Messaging |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| ACG Admin | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Corporate Admin | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | Yes |
| Site Admin | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No | Yes |
| Supervisor | Yes | Yes | Yes | Yes | Yes | No | Yes | No | Yes |
| Maintenance Admin | No | No | No | Yes | No | No | No | No | No |

**Unknown:** Subfeature permissions may be more granular than this top-level matrix. Separate authenticated sessions are required to prove runtime enforcement for each role.

**Preliminary decision:** **Replace.** Use a single canonical permission vocabulary and verify permissions server-side; avoid duplicated role names and ambiguous UI-only mappings.

## Dashboard

### AP-LEG-DASH-001 — Site analytics dashboard

**Observed**

- Views: Analytics and Overview.
- Summary cards: utilization vs expected usage, safety score, active alarms, monthly maintenance, and total cost of ownership.
- Visualizations: utilization comparison, maintenance status with cost/count toggle, alarm breakdown by asset type, alarm breakdown by alarm type, safety compliance, dynamic utilization, and dynamic alarms.
- Context filter includes a date period.

**Preliminary decision:** **Improve.** Preserve the decision outcomes, but define metric semantics, freshness, drill-down behavior, zero/empty states, and comparison periods explicitly.

## Assets

### AP-LEG-ASSET-001 — Asset fleet monitor and inventory

**Observed**

- Summary states: Total, Available, In Use, Bypass, Maintenance.
- Filters/actions: search, Active/All selector, filter control, grid/list toggles, add, export, bulk-selection checkbox, and Functions menu.
- Table fields include asset, status, asset type, last seen, alarms, operator, lease, availability, and per-row edit action.
- After loading completed in TelemetryX/Phoenix, the module showed 83 assets: 47 available, 33 in use, 0 bypass, and 3 maintenance.
- Asset state vocabulary observed: Online, Offline, Out of Range, alarm/no-alarm, assigned operator, and maintenance classification.

### AP-LEG-ASSET-002 — Inline asset detail expansion

**Observed**

Selecting an asset expands inline detail containing:

- HMR/key, seat, travel, and lift readings.
- Last HMR timestamp.
- Model, vehicle serial, device serial, installation date, firmware version, unit ID, classification, starting HMR, rental timer, and pending commands.
- Related actions: Update HMRs, Reset PM Timer, Authorized Operators, Update Firmware, edit, and messaging.

**Safety note:** These command/write actions were not exercised.

### AP-LEG-ASSET-003 — Admin asset management

**Observed**

Admin → Assets contains:

- Asset Type: department and asset-type settings with add/apply/clear actions.
- Data Management: Pending, Sent, and Events views; per-asset state for Settings, Checklist, Operators, HMR Reading, PM Reset, and Message.
- Billing: charger rates with start date, occupancy cost/hour, cost/kWh, admin percentage, billing type, include-charge-time toggle, currency, and historical rate table.

**Preliminary decision:** **Combine/Improve.** Consolidate fleet inventory, device-command state, asset configuration, and lifecycle status into a coherent asset workspace with explicit command safety, audit, and retry behavior.

## Safety and operators

### AP-LEG-SAFE-001 — Safety dashboard

**Observed**

- Search and date/context filtering.
- Fleet Safety Score, Days Accident Free, Overall Compliance, Retrain Operators, alarm/alert toggle, and Best Performers.
- Operator summary states: Total, Active, Inactive, Expired, Soon to Expire.
- Operator list fields: card, name, access level, temporary status, badge number, departments, certification, and incident.
- Operator function menu and per-row drill-down.

### AP-LEG-SAFE-002 — Operator administration

**Observed form fields/actions**

- Name, nickname, site, badge number, access level, mobile phone, email.
- Usage/compliance/monthly alarm/monthly incident thresholds.
- Burden rate/hour.
- Suspend, Send to Devices, Temporary Operator, assigned-to, certification expiry, and certification addition.

### AP-LEG-SAFE-003 — Incident workflow

**Observed**

- Incident history columns: timestamp, kind, asset, location, comments, cost, report.
- Incident entry fields: department, asset, operator, kind, injury yes/no, drug-test-required yes/no, date/time, cost, corrective action, suspend yes/no, damage yes/no, comments, and supporting-document upload.

**Preliminary decision:** **Improve.** Preserve certification, incident, threshold, and coaching outcomes; separate personnel administration from event investigation, enforce audit/versioning, and define sensitive-data access explicitly.

## Maintenance

### AP-LEG-MAINT-001 — Maintenance schedule lifecycle

**Observed**

- Primary views: Schedule, History, Invoice, Analytics.
- Schedule state cards: Upcoming, In Progress, Overdue, Completed.
- Search and Schedule Maintenance action.
- History/detail cards expose next-maintenance threshold, hours remaining, and last-maintenance state.

### AP-LEG-MAINT-002 — Invoice workflow

**Observed**

- State cards: Pending Invoice, Review, Approved, Rejected.
- Upload Documents action.
- Pending-invoice table fields include date, serial number, asset, and type.

### AP-LEG-MAINT-003 — Maintenance analytics

**Observed**

- Summary metrics: Maintenance Cost, Average Cost per Hour, Compliance, and Overdue.
- Visualizations: Maintenance Compliance and Maintenance Status with Cost/Count toggle.
- Asset-level table fields: asset type, asset, key hours, maintenance cost, and cost/hour.

**Preliminary decision:** **Preserve/Improve.** Preserve schedule, invoice, status, and cost outcomes; define a canonical work-order lifecycle, document linkage, approval/audit rules, and metric calculations.

## Tracker

### AP-LEG-TRACK-001 — Map and geospatial operations

**Observed**

- Mapbox/OpenStreetMap map.
- Asset-state legend: Offline/Out of Range, Online but not Logged In, Logged In, Alarms, Bypass, Maintenance.
- Views: Location, History, Geofence.
- Asset/operator selector.
- Geofence selection and Add action.
- Search for asset, Zoom To, and filters for mode, log on/off, maintenance, bypass, alarms, impact, checklist, PM due, low fuel, faulted, and disconnected assets.
- History UI includes date and time controls.

**Preliminary decision:** **Improve.** Preserve location/history/geofence jobs; define freshness, privacy, interpolation, offline semantics, geofence versioning, and high-volume map behavior.

## Reports

### AP-LEG-REPORT-001 — Report categories

**Observed**

Top-level categories:

- Usage
- Compliance
- Alarms
- Financial
- Assets
- Deliveries

### AP-LEG-REPORT-002 — Report definitions and filters

**Observed examples**

- Compliance: Overall Compliance, Checklist Tests, Certification; filters include department, asset, asset mode, and date.
- Alarms: Alarm Overview with Alarm/Alert selection; department, asset, alarm type, asset mode, date, and time filters.
- Financial: Rental Billing, Lease Utilization, Budgeting Report; asset type, asset, contract, contract term, and overtime-only filters.
- Assets: Asset Serial Details with asset filter.
- Deliveries: scheduled report definition with type, name, start/end/never-stops, frequency, format, recipient emails/people, time, and report parameters for department/asset/operator.

**Safety note:** No report was exported and no delivery was configured or sent.

**Preliminary decision:** **Combine/Improve.** Preserve report outcomes while unifying filter patterns, exports, scheduled delivery, recipient governance, retention, and audit.

## Administration

### AP-LEG-ADMIN-001 — Company and site model

**Observed**

- Company records with address/contact/admin metadata and one-to-many sites.
- Company edit includes logo, SSO Login, and Peplink OrgID integration.
- Site Common Info includes site/admin/contact/address/time-zone information.
- Site Services and Products include Track Assets, Analytics, Load Settings, Idling Options, Gateway, BYD Integration, Proximity Sensor, SmartFleet Dashboard, and product families including Ultimate, Advanced, Vital, CellTrac, Momentus, Momentus II, Altus, and Altus II.

### AP-LEG-ADMIN-002 — Departments and shifts

**Observed**

- Departments table with edit actions.
- Shift management fields: enabled, shift, start, end, supervisor, days, and actions.

### AP-LEG-ADMIN-003 — Site settings

**Observed categories**

- Dashboard thresholds and red/yellow card thresholds.
- Safety-score components and recommended-coaching alerts.
- Unit preferences: temperature, long distance, mass, speed, short distance.
- Operational-exception thresholds and associated seat/login-hour windows.
- Safety and maintenance alert timing and checklist-compliance thresholds.
- Hosting and warranty.
- Operator recertification and alert timing.
- Integration settings: EBis, TMA, BMS.

### AP-LEG-ADMIN-004 — SmartFleet settings

**Observed**

- Authentication/API Token list and Create Token action.
- State-of-charge alarm/alert thresholds.
- Fault-code selection by batteries/chargers.
- Available views and refresh rate.

**Safety note:** No API token was created.

### AP-LEG-ADMIN-005 — Web users

**Observed**

- Searchable user table with Name, Role, Phone, and Email.
- Add, delete, export, and role-settings actions.
- Role settings are displayed read-only in the inspected surface.

**Preliminary decision:** **Replace/Improve.** Preserve business configuration outcomes, but separate tenant administration, device configuration, integrations, billing, support, and identity/security into explicit bounded domains with strong audit controls.

## Support and RMA

### AP-LEG-SUPPORT-001 — Ticket workflow

**Observed**

- Top-level views: Tickets, RMA, History.
- Ticket fields: ticket number, type, description, reported by, site, status, due date, priority, owner, frequency, customer and ACG tracking numbers, reproduction steps, patterns, notes, operators, attachments, labels.
- Ticket summary states: New, Open, In Progress, Overdue.
- Ticket types observed include Support, Bug, Enhancement, and Training.

### AP-LEG-SUPPORT-002 — RMA workflow

**Observed state vocabulary**

- To Review
- Issued
- Received
- Send Quote
- Approval Needed
- Declined
- In Progress
- Shipped
- Overdue

### AP-LEG-SUPPORT-003 — Historical support corpus

**Observed**

- Closed/history view with pagination and historical issue labels such as hardware, bug, client education, and configuration-page concerns.
- This corpus may be valuable evidence for migration priorities and recurring user problems.

**Preliminary decision:** **Investigate/Combine.** Determine whether support/RMA belongs inside Asset Pro, in Linear, or in a dedicated support system; preserve product-learning value and customer/asset traceability without duplicating ticket systems.

## Onboarding

### AP-LEG-ONBOARD-001 — Multi-step tenant onboarding

**Observed progress steps**

1. Create Company
2. Create Department
3. Create Checklist
4. Create Asset Type
5. Create Operator
6. Create Webuser
7. Create Asset List

The first step collects company and site addresses, country/state/city/ZIP, and a same-as-company-address option before Next.

**Constraint:** Later steps require advancing a persistent onboarding workflow; no company was created because that would leave shared demo records and deletion was not authorized.

**Preliminary decision:** **Replace/Improve.** Preserve onboarding dependencies, but make the process resumable, idempotent, auditable, and safe to retry.

## ACG Admin / diagnostics

### AP-LEG-DIAG-001 — Asset diagnostics and stock inventory

**Observed**

- Asset Diagnostics with search/export and fields such as company, site, asset, type, unit ID, firmware, serial, model, MAC/ICCID, last update/login, HMR, and device timestamp.
- In TelemetryX/Phoenix context, the visible subareas included Stock Inventory, Department, Assign, Mark Unit, and New Asset.
- Stock/unit table fields include Unit ID, Product, Device Model, Modem Type, and Status.

**Safety note:** Assign, Mark Unit, New Asset, and Export were not exercised.

## Cross-cutting findings

1. **Context and entitlement complexity — High product risk.** Company, site, product assignment, services, products, role, and subfeature permissions all influence the surface.
2. **Role terminology drift — High migration risk.** Role selector and role-access labels differ.
3. **Extremely broad AcgAdmin access — High security risk.** One account can access identity, support, billing, integrations, API-token creation, device commands, and tenant configuration.
4. **Hidden write-capable DOM — Medium UX/automation risk.** Multiple edit/help forms are mounted in the DOM even when not visibly open, creating noisy accessibility output and possible accidental interaction.
5. **Async loading can mimic empty states — Medium UX/test risk.** Assets initially displayed an empty state with a nonzero paginator during loading; after five seconds the correct 83-asset dataset appeared. Loading, empty, and error states are not clearly differentiated.
6. **Device commands require explicit safety design — High operational risk.** Reset PM Timer, Update Firmware, HMR changes, assignment, mark-unit, and pending-command workflows need confirmation, audit, authorization, retry, and rollback semantics.
7. **Report delivery can trigger external communication — High governance risk.** Scheduled recipients, other emails, and PDF/report delivery require consent, recipient controls, and audit.
8. **Support history is product intelligence — High discovery value.** It contains recurring hardware, configuration, training, and software patterns that should inform Asset Pro priorities.
9. **Data quality signals — Investigate.** Duplicate user names, inconsistent role names, placeholder-like contact data, and mixed historical timestamps were visible in the demo corpus.
10. **Navigation changes by context — Important UX behavior.** A context with no assigned product hides most operational modules rather than explaining their prerequisites.

## Coverage matrix

| Area | Entry mapped | Subnavigation mapped | Key fields/states mapped | Runtime write tested | Role comparison tested |
|---|---:|---:|---:|---:|---:|
| Global shell/context | Yes | Yes | Yes | No | Partial |
| Dashboard | Yes | Yes | Partial | No | No |
| Assets | Yes | Partial | Yes | No | No |
| Safety/operators | Yes | Partial | Yes | No | No |
| Maintenance | Yes | Yes | Yes | No | No |
| Tracker | Yes | Yes | Partial | No | No |
| Reports | Yes | Yes | Yes | No | No |
| Company/site admin | Yes | Yes | Yes | No | No |
| Users/roles | Yes | Yes | Top-level matrix | No | Config only |
| Support/RMA | Yes | Yes | Yes | No | No |
| Onboarding | Yes | Progress map | Step 1 only | No | No |
| Diagnostics/stock | Yes | Partial | Yes | No | No |

## Open questions

| ID | Question | Owner needed | Consequence if unresolved |
|---|---|---|---|
| AP-Q-001 | What are the authoritative role names and IDs? | Product + backend | Permission migration errors and terminology drift |
| AP-Q-002 | Which entitlements come from role, service, product, company, or site? | Backend | Incorrect navigation and authorization model |
| AP-Q-003 | Are support/RMA records in scope for Asset Pro or an external system? | Product | Duplicate workflow and migration scope uncertainty |
| AP-Q-004 | What device commands are reversible, queued, retried, or externally executed? | Backend/operations | Operational safety risk |
| AP-Q-005 | What are metric formulas, freshness, and data sources? | Product/data | Dashboard/report parity cannot be verified |
| AP-Q-006 | Which external integrations are actively used: Peplink, EBis, TMA, BMS, BYD, SmartFleet? | Backend/operations | Hidden dependencies and migration failure |
| AP-Q-007 | Which lower-privilege test accounts are available? | User/product | Runtime permission behavior remains unproven |
| AP-Q-008 | Can a disposable tenant be created and later deleted safely for onboarding testing? | User/operations | Onboarding steps 2–7 remain unobserved |

## Next reconnaissance sequence

1. Capture lower-privilege role sessions and compare route visibility/enforcement.
2. Deep-map one representative asset lifecycle without issuing device commands.
3. Deep-map one maintenance work-order and invoice lifecycle using disposable demo data.
4. Deep-map one operator certification and incident lifecycle using disposable demo data.
5. Inspect report filters and on-screen results without export/delivery.
6. Corroborate integrations and calculation rules against code/API/schema/documentation when access is available.
7. Convert stable findings into a traceability matrix and approved Linear projects/issues.

## Contract-oriented evidence plan

The next passes will trace evidence to future-state contracts rather than legacy screens.

| Evidence work package | Legacy evidence target | Contract to prove | Required proof | Future bounded domain | Linear state |
|---|---|---|---|---|---|
| AP-EVID-ROLE-001 | Same route/state matrix under Company Admin, Site Admin, Supervisor, and Maintenance Admin sessions | Identity & Entitlements + Company/Site Context | Visible routes, direct-route denial, field/action restrictions, API/server response, audit attribution | Shared platform | Draft only until team/workflow conventions are approved |
| AP-EVID-CMD-001 | One representative asset with HMR, PM reset, firmware, pending command, and authorization surfaces | Device Command Safety Envelope | Actor/entitlement, impact preview, confirmation, idempotency key, queue states, retry limits, timeout, failure, cancellation, audit, recovery | Fleet/Device Operations | Draft only; no command execution without a separately bounded test |
| AP-EVID-MAINT-001 | One reversible maintenance work-order and invoice lifecycle | Maintenance lifecycle | States, transitions, actor permissions, required data, partial failure, document linkage, approval, audit, rollback/recovery | Maintenance | Draft only; use disposable demo data |
| AP-EVID-SAFE-001 | One reversible operator certification and incident lifecycle | People/Safety lifecycle | Sensitive fields, status transitions, evidence upload, suspension behavior, notifications, audit, retention, recovery | People & Safety | Draft only; use synthetic operator/data |
| AP-EVID-INT-001 | Peplink, EBis, TMA, BMS, BYD, SmartFleet and device/data-management surfaces | Integration Ownership & Data Flow | System owner, source/target, direction, contract, auth, cadence, freshness, retries, dead-letter/reconciliation, observability, data classification | Tenant Administration + Integration adapters | Investigate until corroborated |
| AP-EVID-MET-001 | Dashboard, safety, maintenance, utilization, TCO, compliance and alarm metrics | Metric Provenance & Freshness | Formula, source entity/event, aggregation window, timezone, freshness SLA, stale/partial semantics, reconciliation | Reporting/Analytics | Investigate until corroborated |
| AP-EVID-RPT-001 | Report filters, exports and scheduled deliveries | Report Recipient Governance | Recipient authorization, external-domain warning, consent, preview, schedule state, delivery result, retry, revocation, retention, audit | Reporting | No send/export during discovery |
| AP-EVID-STATE-001 | Loading, empty, error, stale, partial and permission states across core modules | UX State Contract | Trigger, visible state, accessible messaging, available recovery, telemetry event | Shared frontend foundation | Evidence before implementation |

### Required evidence record for every work package

- Stable legacy capability ID and environment/context.
- Actor, role, company, site, product, service, and entitlement context.
- Reproduction path and screenshot(s).
- Observed request/response or state transition when safely available.
- Fact/confidence label: Observed, Corroborated, Documented, Reported, Inferred, Unknown, or Decided.
- Product impact and risk.
- Future contract and bounded-domain mapping.
- Preserve/Improve/Combine/Replace/Retire/Investigate recommendation.
- Requirement ID, PRD section, proposed Linear project/issue, implementation link, and verification evidence.

### Linear traceability structure (proposal; not yet configured)

- **Initiative/Rock:** TelemetryX product outcome.
- **Project/Pebble:** One bounded domain or coherent releasable capability.
- **Milestone/Parent issue:** One user-journey or contract slice.
- **Issue:** One independently verifiable outcome.
- **Evidence links:** Every issue references the relevant `AP-LEG-*` and `AP-EVID-*` records.
- **Contract labels:** `identity-entitlements`, `context`, `audit`, `device-command`, `integration`, `metric`, `report-governance`, `ux-state`.
- **Discovery status:** `Observed`, `Needs corroboration`, `Decision required`, or `Ready for requirement`—represented by labels until the final workflow is approved.

---

“We are not cloning the legacy product. We are extracting its truth and using it to build TelemetryX.”
