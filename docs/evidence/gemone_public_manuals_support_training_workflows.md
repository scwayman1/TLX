# GemOne public manuals, support, training, and workflow evidence

**Scope:** Publicly accessible GemOne/GEM One material only; no authentication, control bypass, or non-public data. Research completed 2026-08-22.

## Executive findings

GemOne exposes an unusually broad public technical-documentation index. Its public installation page identifies portal guides, Sapphire and Onyx installation/operation manuals, troubleshooting material, specification sheets, add-on guides, and multilingual customer-enablement packs; the page itself calls the list “up to date.”[1] A separate public brochure library spans audience/segment brochures, product-range material, checklists, case studies, safety posters, and multilingual YouTube playlists.[2]

The deepest workflow evidence comes from two product generations/surfaces.
The 2024 **Sapphire Portal User Guide** documents a site-oriented portal used by dealerships, end customers, and GemOne staff, with dashboards, reports, GPS, multisite views, equipment/operator administration, checklists, subscriptions, and support.[3]
The December 2024 **My Happy Fleet** enablement packs document a company/subcompany hierarchy and a newer Fleet / Access & Safety workflow for assets, devices, operators, access keys, sessions, remote lockout, and impact detection.[4][5][6]

Public evidence describes operational workflows in considerable detail, but there is no publicly indexed changelog/release-note archive, public API reference, role-permission matrix for portal users, service-level commitment, or clear version-to-version migration guide. Product/version naming overlaps (Sapphire V2/V2S/V2SC/V3, Onyx OX-G/OX-L/OX-C/V4, Sapphire Portal, GemOne Cloud, and My Happy Fleet), creating ambiguity about which portal and guide applies to a specific deployment.[1][3][4]

## Source register

| ID | Public source | Type / workflow value | Date / freshness flag |
|---|---|---|---|
| [1] | GemOne Installation guides | Canonical directory for portal guides, Sapphire/Onyx hardware and operation guides, troubleshooting, add-ons, spec sheets, and customer-enablement packs. | Page first published 2022 and modified 2026-08-11 via public WordPress metadata; individual links vary. Some entries are explicitly “old,” “needs to be updated,” “under development,” or “NEW.” |
| [2] | GemOne Brochures | Canonical directory for product/segment brochures, checklists, case studies, posters, and multilingual training/video playlists. | Page first published 2023 and modified 2026-06-12 via public WordPress metadata. Mixes current 2026 collateral with explicitly “Old” Onyx items. |
| [3] | Sapphire Portal User Guide | 58-page operator/admin manual; strongest source for reports, dashboards, checklists, alerts, GPS, subscriptions, and support. | ©2024; filename path 2024/03. Currentness after later GemOne Cloud/My Happy Fleet material is not explained. |
| [4] | My Happy Fleet — Basic Platform Usage | Company/subcompany administration; assets/devices/operators/access; sessions; lockout; impact setup. | File path 2024/12; document body is undated and appears customer-specific (“Canada Post”), so general applicability should be confirmed. |
| [5] | My Happy Fleet — Access Control | Concept model and step-by-step PIN/RFID/operator/machine access workflow. | Body says “Customer Enablement — January 2023”; hosted in 2024/12. Potentially stale relative to the hosting date. |
| [6] | My Happy Fleet — Installation and Configuration for Basic Setup | Device registration, pairing/unpairing, and input/hour-meter configuration. | File path 2024/12; body is undated. |
| [7] | Sapphire System Troubleshooting Guide | Public fault-isolation playbook plus regional escalation contacts. | ©2022 and therefore stale-risk; installation page still labels it an old portal/troubleshooting resource. |
| [8] | Session Reporting | Explains KPIs, key time/seat time, operator coaching, staff review, and compliance use. | Published 2024-02-15; modified 2024-04-29. Marketing article, not a procedural manual. |
| [9] | How Impact Reporting Works | Explains real-time impact notifications, custom thresholds, automatic lockout, inspection/clearance, and training response. | Published 2023-08-07; modified 2024-05-03. Marketing article. |
| [10] | Licence Management | Explains certification tracking, expiry alerts, expired-license equipment denial, and related safety controls. | Published 2023-11-14; unchanged. Marketing article. |
| [11] | Automated Safety Checklists | Explains mandatory, customizable/randomized machine checklists, critical lockout, and audit trail. | Published 2024-12-03; modified 2024-12-12. |
| [12] | Utilization Reporting | Explains machine hours, idle time, maintenance/fleet-composition decisions, and single-sign-on reporting across Sapphire/Onyx data. | Published 2025-05-16; modified 2025-05-19. |
| [13] | Atlas Toyota case study | Evidence for dealer onboarding, technical training, post-sales account management, cloud visibility, Excel export, and customer advisory workflow. | Published 2024-04-24; modified 2026-03-23. Case study/marketing evidence. |
| [14] | ManualsLib GemOne index | Third-party index and mirror for publicly indexed GemOne manuals, including a Sapphire V2SC procedures manual. | Undated; use only as discovery/availability corroboration, not as the authority over GemOne-hosted files. |

## Operator workflows

### 1. Company, site, and fleet setup

My Happy Fleet models a parent **Company** with **Subcompanies** (apparently local sites). A user can “View As” a subcompany, switch sites, manage company-level users, and configure impact settings for an entire fleet or selected assets.[4] In the Sapphire portal, users with multiple customers can switch sites in one account, but subscriptions are customer-specific and additional-site access is granted by a system administrator.[3]

Asset setup is explicit: create an asset under **Fleet**, then maintain groups/labels, organizational unit, operating hours, linked device, technical details, and calibration profiles.[4] Asset deletion is blocked while devices, operators, or geofences remain linked, revealing entity referential dependencies.[4]

### 2. Device claim, pairing, and telemetry configuration

The My Happy Fleet workflow requires entering device make/brand and IMEI, ensuring the device is sending packets, matching an unclaimed/new device, claiming/registering it, and then linking it to an asset/machine.[4][6]
Devices can be found by IMEI/model, paired, unpaired, or re-paired; input settings should match the physical installation, and key switch/hour meter are typical inputs.[6]
The selected operational-hours input becomes the basis for downloaded usage reports.[6]

### 3. Operator identity, roles, credentials, and machine access

The public access-control concept model contains four key entities: **operator**, **access key**, **asset/machine**, and **role**. One operator may hold multiple PIN/RFID keys and one or more roles; one key belongs to only one operator; an operator may be assigned to multiple machines; and keys are not assigned directly to machines.[5] Named machine-level roles are **operator, technician, and supervisor**.[5]

The administrative workflow is: create an operator, assign at least one role, create a 4–6 digit PIN and/or RFID credential, link keys to the operator, then link the operator to one or more machines with asset-specific roles.[4][5]
Operator details expose linked keys, linked assets, training, and licences; the guide also advises anonymized displayed names where appropriate.[4][5]

### 4. Shift/session operation and reporting

A Sapphire session starts when an operator logs into equipment and ends when the equipment is turned off; the session report records start/stop time, duration, key hours, and configured input hours, filterable by operator/equipment/date and exportable as CSV.[3] My Happy Fleet similarly exposes machine/operator working sessions with start/end dates and Excel/CSV export.[4][5]

Session reporting supports operator and machine performance review using key time, seat time, safe/productive driving KPIs, idle-time analysis, coaching, recognition, and targeted training.[8] This is management workflow evidence rather than merely telemetry: the public article explicitly positions reports as inputs to staff reviews and operational policy changes.[8]

### 5. Pre-start safety checklist and lockout

Sapphire checklist questions can be critical/non-critical and pre-start/post-start. An unexpected critical answer locks equipment; pre-start critical failure prevents starting, while post-start critical failure allows the current run but locks the module after key-off; an override code is then required.[3] Prompts may be shift-based, time-based, operator-change-based, or ad hoc/no prompt, and question updates must be synchronized to powered-on, connected modules.[3]

The newer public description adds that checklists can be machine-specific, customized, randomized, mandatory, time-stamped, and retained as an audit trail; critical issues trigger operator lockout.[11] Checklist results are Passed, Failed, Critical Fail, or Incomplete, and reports include equipment, operator, completion time, duration, failed questions, answers, and comments.[3]

### 6. Impact event workflow

Impact thresholds can apply fleet-wide or to selected assets/groups and distinguish registration, warning, and critical levels; critical impacts may lock the machine depending on configuration.[4] The Sapphire portal reports force/severity, direction/position, time, equipment, and operator; supports comments; and aggregates count, average severity, and maximum severity by operator or equipment.[3]

The operational response described publicly is: real-time notification → inspect the equipment → clear it for safe operation → analyze high-risk areas/operators → deliver targeted training or preventive measures.[9] Email subscriptions can trigger above a chosen 1.0g–6.0g threshold and include equipment, severity, and operator.[3]

### 7. Licence and training compliance

Operator licence records drive 30-day, 14-day, and expired states; once expired, portal logic denies the operator access until licence data is updated, while missing licence details do not deny access.[3] Automated alerts support proactive renewal.[10] Training dates use equivalent status buckets and email reports but, unlike licences, expired training dates do not themselves block equipment; local procedure must enforce the training requirement.[3]

### 8. Utilization, maintenance, and fleet optimization

Dashboards and reports expose key hours, input timers (for example seat/forward/reverse), most/least active equipment, operator utilization, equipment productivity by model, accumulated/detailed hour reports, and national/multisite utilization.[3] Public product guidance uses those readings to identify under/over-used assets, right-size or reallocate fleets, distinguish true versus operational idle time, and schedule maintenance based on usage rather than reactive failure.[12]

### 9. Location, geofence, messaging, and remote control

For GPS-equipped customers, Sapphire supports equipment tracking, up to five customer zones, and route tracing.[3] Portal users can remotely unlock modules, maintain override codes, and send individual or broadcast messages to online equipment; message logs retain equipment, operator, message, response, and response time.[3] My Happy Fleet additionally documents remote ignition lock/unlock for one or several assets.[4]

## Roles and service model

- **Portal users / administrators:** configure sites, users, operators, equipment, access, safety rules, reports, subscriptions, messaging, and remote actions.[3][4]
- **Operators/drivers:** authenticate with PIN/RFID, complete checklists, operate assigned machines, generate sessions/impacts, and respond to messages.[3][5]
- **Technicians and supervisors:** explicit machine-level operator roles in My Happy Fleet access control; the public pack does not define their permission differences.[5]
- **Dealers:** in-scope Sapphire portal users and service intermediaries. The Atlas Toyota case describes dealer sales/installation technical training, post-sales account-management support, customer-fleet cloud visibility, Excel export, and advisory analysis for leasing/buying decisions.[3][13]
- **End customers / fleet managers:** consume dashboards, exceptions, reports, alerts, coaching/compliance evidence, and fleet/maintenance insights.[3][8][12]
- **GemOne/system administrators/support:** provision portal access, assist with site/input configuration, and resolve device/firmware/connectivity issues.[3][7]

The public support model is regional human escalation rather than a visible self-service knowledge base: the 2024 portal guide lists EMEA, US, and APAC phone/email channels, while the 2022 troubleshooting guide supplies common fault trees and directs unresolved cases to support.[3][7] The case study adds technical training plus post-sales account management, but no public response-time, uptime, severity, or escalation SLA was found.[13]

## Reports and alerts inventory

**Dashboards/reports:** site summary; equipment shift utilization; most productive equipment/operator; utilization comparison; checklist summary/completion/exceptions; expiring licences; inactive operators; concurrent sessions; training scheduler; impact/operator/equipment summaries; offline equipment (>72 hours); equipment productivity; session report; accumulated and detailed key-hour reports; GPS routes/zones; multisite utilization/impacts/checklists/licences; and national hour/utilization reports.[3]

**Alerts/subscriptions:** configurable-threshold impact email, failed/critical-checklist email, product/general updates, hour-meter reports, national hour/utilization reports, licence-expiry reports, training-expiry reports, and thresholded impact reports; frequencies shown for many report subscriptions are daily, weekly, or monthly.[3]

## Documentation gaps and diligence cautions

1. **No public release-note/changelog stream found.** The installation and brochure indexes are living lists, not a versioned release archive.[1][2]
2. **Portal-generation ambiguity.** Sapphire Portal and My Happy Fleet use different navigation/entity vocabularies, with no public migration or equivalence map.[3][4]
3. **No public portal-user RBAC matrix.** Operator/technician/supervisor machine roles are named, but permissions for portal users, dealers, customer administrators, and GemOne staff are not documented publicly.[3][5]
4. **No public API/integration reference found.** Reports export CSV/Excel/PDF and devices exchange queued configuration, but interfaces, schemas, limits, audit APIs, and integration contracts are absent from the reviewed public corpus.[3]
5. **Service commitments absent.** Public contacts and account-management claims exist, but no SLA, support hours, severity definitions, escalation path, uptime target, or maintenance-window policy was found.[3][13]
6. **Stale/undated material mixed with current content.** The canonical pages themselves label some guides old, under development, or needing update; the 2022 troubleshooting guide and January 2023 access-control pack remain public beside 2024–2026 artifacts.[1][5][7]
7. **Customer-specific training pack.** “Canada Post” examples and instructions to ignore certain fields make the Basic Platform Usage deck useful workflow evidence but not a neutral universal administrator manual.[4]
8. **Marketing versus operating truth.** Blog posts and case studies support intended use and service claims, while configuration details should be weighted toward the manuals.[3][8][13]
9. **Third-party mirrors are secondary.** ManualsLib confirms public discoverability but may lag official files; GemOne-hosted sources should control when versions conflict.[1][14]

## Bottom line

The public corpus is sufficient to reconstruct GemOne’s core operating model: company/site → asset → device; operator → role → PIN/RFID → machine access; session/checklist/impact/location/usage telemetry → dashboards, alerts, exports, compliance action, training, maintenance, and fleet optimization.[3][4][5]
It is not sufficient to establish current production release state, exact portal-user authorization boundaries, integration contracts, or contractual support/service levels.[1][2][3]

## Sources

[1] https://www.gemone.com/install — GemOne Installation guides
[2] https://www.gemone.com/brochures — GemOne Brochures
[3] https://www.gemone.com/wp-content/uploads/2024/03/EN-GemOne-Sapphire-V2SC-portal-S02.pdf — Sapphire Portal User Guide
[4] https://www.gemone.com/wp-content/uploads/2024/12/Customer-Enablement-Basic-Platform-Usage.pdf — My Happy Fleet Basic Platform Usage
[5] https://www.gemone.com/wp-content/uploads/2024/12/Customer-Enablement-Access-Control-.pdf — My Happy Fleet Access Control
[6] https://www.gemone.com/wp-content/uploads/2024/12/Customer-Enablement-Basic-Device-Installation-Config-EN.pdf — My Happy Fleet Installation and Configuration
[7] https://www.gemone.com/wp-content/uploads/2022/09/EN-GemOne-Sapphire-V2-Trouble-Shooting-Guide.pdf — Sapphire System Troubleshooting Guide
[8] https://www.gemone.com/material-handling/session-reporting — Session reporting
[9] https://www.gemone.com/material-handling/how-impact-reporting-works — How Impact Reporting Works
[10] https://www.gemone.com/material-handling/licence-management-for-safety-compliant-warehouses — Licence Management
[11] https://www.gemone.com/material-handling/automated-safety-checks-for-enhanced-warehouse-safety — Automated Safety Checklists
[12] https://www.gemone.com/material-handling/utilization-reporting-minimise-machine-downtime-and-optimise-fleet-composition — Utilization Reporting
[13] https://www.gemone.com/material-handling/atlas-toyota-case-study-2 — Atlas Toyota Case Study
[14] https://www.manualslib.com/brand/gemone — GemOne ManualsLib index
