# GemOne public technical, API, integration, specification, and release research

**Research cut-off:** 2026-08-22  
**Scope:** Publicly accessible GemOne/GEM One telematics materials only; no authentication, control bypass, infrastructure scanning, or non-public data.  
**Terminology:** This report concerns **GemOne**, the TVH-affiliated industrial-fleet telematics business, not General Dynamics' unrelated “GEM One” encryption-management product.

## Executive technical readout

### Verified facts

- GemOne's current public portfolio is organized around **GemOne Cloud** (the consolidated IoT/fleet-data platform), **Onyx** (mixed rental/construction fleet management and tracking), and **Sapphire** (material-handling fleet and safety management). GemOne positions Cloud as a normalized, near-real-time consolidation layer for multiple machine makes/models and trackers from other telematics providers.[1][5][10]
- The most explicit public API statements are commercial/capability claims: GemOne says Cloud provides “powerful API integrations,” and its system-comparison sheet lists usage-based billing via API.[2][5] No public endpoint reference, OpenAPI/Swagger file, SDK, authentication flow, schema, rate-limit policy, webhook specification, sandbox, or versioning policy was found in the reviewed public site, sitemap, WordPress content/media inventory, indexed web results, or public manuals.
- GemOne publicly claims integration with ERP, invoicing, rental-planning, and service applications, plus ingestion of tracker data from other telematics providers.[1][3][18]
  The public sources do not disclose whether those integrations use REST, AEMP/ISO 15143-3, file exchange, direct database connectors, webhooks, partner adapters, or bespoke professional services.
  GemOne discusses AEMP historically in an educational article, but does **not** state there that GemOne implements AEMP.[20]
- **Onyx V4** is a screenless IP67 tracker with a 9–97 VDC working range (120 V over-voltage protection), internal backup battery, 4G LTE Cat 1 with 2G fallback, 3FF SIM plus eSIM, Bluetooth 5.4/LE, multi-constellation GNSS, two CAN-FD buses, J1939/CANopen/custom multiprotocol support, RS-485, Wiegand, eight analog/digital inputs, two built-in relays, and impact/movement sensing.[6][7]
- **Sapphire V2SC** is an in-cab Android touchscreen system. Its current Americas specification lists 12–80 VDC, 3.5G/4G LTE, Wi-Fi, GPS, Bluetooth, a 7-inch 1280×800 sunlight-readable display, 10-point capacitive touch, IP67, and multiple FCC/IC/CE/UL/MIL/ISO/J1455/RoHS claims.[8]
- Sapphire's public Wi-Fi guide exposes a concrete device-to-cloud flow: the device typically uses 4G or optional Wi-Fi; all device/server traffic is stated to use TLS 1.2; Sapphire runs Android 9; private APNs and disabled root access are described as hardening measures; device/portal traffic is bidirectional TCP to `mservice-prod.ge-monitoring.com` on port `5571`; portal-to-device messages include driver lists, override lists, checklists, and configuration, while device-to-portal messages include checklists, impacts, and sessions.[9]
- Public hardware compatibility is broad but qualified. GemOne repeatedly says “any make or model,” yet Onyx CAN functionality requires machine-specific setup and GemOne-supported adapters/configuration; the installation guide says connectors can be configured for the fleet and CAN connections depend on machine/BMS type.[3][7][11]
- Sapphire add-ons include PIN/RFID/fob access control, impact detection/lockout, safety checklists, licence/certification management, cameras, forklift load sensing, and battery monitoring.[4][11][14]
- GemOne's 2026 privacy notice says GemOne NV may act as controller or processor, may share data within the TVH group, primarily processes data in the EEA but may transfer it outside the EEA using adequacy or contractual safeguards, applies need-to-know and confidentiality controls, and recognizes GDPR data-subject rights.[15]

### Interpretation

- The public architecture is consistent with a **device → cellular/Wi-Fi uplink → GemOne-hosted service → Cloud portal/integration layer** model. Sapphire's bidirectional TCP service is explicitly documented; Onyx's exact uplink application protocol and Cloud's northbound API are not.[1][7][9]
- GemOne Cloud appears to be a normalization/aggregation layer rather than only a first-party-device portal, because GemOne claims support for other telematics providers, any machine make/model, normalized data, and downstream business-system integration.[1][10][18]
- “API integration” is commercially supported but not publicly self-service. The repeated reference to professional services and the absence of developer artifacts suggest partner/customer-specific enablement.[2][10][11] This is an interpretation, not a published contractual limitation.

## Product and architecture findings

### 1. GemOne Cloud

**Facts**

- Cloud is described as a single consolidated online IoT platform with near-real-time fleet data, dashboards/reports/alerts, machine hours, CAN data, sessions, GPS/location history, battery monitoring, checklists, impacts, operator access, licence management, load sensors, AI cameras, and geofencing.[1][10][18]
- Publicly described Cloud flow: connect machines with telematics devices; view fleet data in one place; derive machine/operator insights; act on those insights.[10]
- Cloud is claimed to accept any machine make/model and any tracker from any telematics provider, and to integrate with existing business IT systems.[1][10][18]
- The 2026 migration page says legacy Sapphire customers are moving to Cloud for multi-language checklists, SSO/modern authentication, national reporting, impact-status accuracy, improved user/operator management, active-session visibility, and API integrations.[2]

**Interpretation**

- Cloud's stated normalization and multi-provider ingestion imply a canonical asset/telemetry model, but no public schema identifies entities, field semantics, units, timestamps, tenancy boundaries, or event-delivery guarantees.

**Unknowns**

- Hosting provider/region for production Cloud; tenancy/isolation design; availability SLA; RPO/RTO; data residency choices; backup/DR design; observability; audit logging; role model; SSO protocol and identity-provider compatibility.
- Exact latency behind “near real-time,” offline buffering rules, ordering/deduplication behavior, and retention of operational telemetry.

### 2. Onyx V4

**Facts**

- Electrical/environmental: 9–97 VDC operation with protection to 120 V, 2550 mAh internal Li-ion backup battery, IP67, −20 °C to 60 °C, 166×90×40 mm, and 336 g.[6][7]
- WAN/GNSS: 4G LTE Cat 1 with 2G fallback, 3FF SIM plus eSIM, internal antennas, and GPS/GLONASS/BDS/Galileo/QZSS receiver with stated 2.5 m accuracy.[6][7]
- Machine interfaces: two CAN-FD buses with automatic baud detection and configurable termination; J1939, CANopen, and custom protocol support; eight 0–97 V analog/digital inputs; two relays; 12 V/2 A auxiliary power; Wiegand; and RS-485.[6][7]
- Sensors/peripherals: 3-axis accelerometer plus 3-axis gyroscope, keypad/RFID reader, remote ignition blocking via relay, and machine/BMS CAN readout.[6][7]
- The reader supports PIN plus HID, EM, and MIFARE technologies; its Wiegand D0/D1 lines carry card/PIN data to Onyx.[7]
- Sleep behavior: after five minutes with ignition off and no movement, GSM/Bluetooth/GPS switch off, while movement, ignition, and external power remain monitored; the tracker wakes on motion or ignition and sends an hourly message when inactive.[7]

**Compatibility caveat**

- “Any make/model” applies at the tracking-platform level, but deep CAN data is not plug-and-universal. GemOne says CAN requires bespoke setup; the guide calls for machine-specific instructions/adapters.[3][7]

### 3. Sapphire V2SC

**Facts**

- Hardware: 12–80 VDC; 7-inch 1280×800, 800 cd/m² display; 10-point capacitive touch with glove/rain modes; IP67; 14–149 °F operating range; cellular, Wi-Fi, GPS, and Bluetooth.[8]
- Device software/security: Android 9; GemOne-specific configuration; private APNs; root disabled; optional Wi-Fi; TLS 1.2 to GemOne's server.[9]
- Access/operations: PIN/RFID/fob authorization, pre-start checklists and optional lockout, impact reporting, sessions, hours, certification management, cameras, load sensors, and battery monitoring.[4][5][11]
- The Cloud portal guide shows that portal administrators create users/operators, assign roles and assets, allocate PIN or HID RFID credentials, and configure checklist groups/questions/schedules.[9]

**Data-flow detail**

1. Operator/device state is captured on the truck (credentials, checklists, impacts, sessions).[9]  
2. Device uses 4G or configured Wi-Fi and a bidirectional TLS 1.2 TCP connection to `mservice-prod.ge-monitoring.com:5571`.[9]  
3. Cloud/portal sends lists, checklists, overrides, and configuration to the device; the device uploads captured operational events.[9]  
4. Users access a GemOne-hosted web portal; no on-premises server is required for Wi-Fi use.[9]

### 4. Cameras, load sensing, and BMS

**Cameras**

- The Series 2 AI camera provides pedestrian detection, visual/audible alerts up to 90 dB, night-vision operation, local playback, SD-card recording, support for up to four cameras, and approximately 25 ft/8 m detection distance.[12][13]
- The camera guide says a 512 GB SD card is standard, estimates about 11 days of footage, overwrites oldest files when full, and records whenever the key is on.[13]
- The AI camera sheet lists 1080p, IP69K, 130° field of view, and −4 °F to 140 °F operation.[13]

**Battery monitoring**

- The BMS supports low-voltage 9–95 V and high-voltage 40–150 V variants, lead-acid and lithium-ion use cases, IP68, −20 °C to 70 °C, current/voltage/temperature/electrolyte sensing, BLE 4.2/5.0, 4G LTE Cat 4 with 2G/3G fallback, and GPS/GLONASS/BeiDou.[14]
- The guide marks its CAN 2.0 A/B interface as reserved for future use, a useful boundary on current BMS integration.[14]

## API and integration assessment

### Verified public API evidence

| Capability | Public evidence | Confidence |
|---|---|---:|
| Cloud supports API integrations | Migration page names “powerful API integrations.”[2] | High that capability exists; low on implementation detail |
| Usage-based billing via API | Current system comparison explicitly lists it.[5] | High |
| Business-system integration | ERP, invoicing, rental planning, and service applications are named.[1][3][18] | High as product claim |
| Third-party tracker ingestion | Cloud says any tracker from any telematics provider can be added.[1][10] | High as product claim |
| AEMP awareness | GemOne educational content discusses AEMP's standard and API evolution.[20] | High for awareness; **not evidence of implementation** |

### Not found publicly

- API base URL, endpoint catalog, OpenAPI/Swagger document, GraphQL schema, SDK, sample code, Postman collection, changelog, or developer portal.
- Authentication/authorization method (OAuth 2.0, client credentials, API keys, scopes), tenant model, rate limits, pagination, errors, retries, idempotency, webhooks, data freshness, schema versioning, or deprecation policy.
- Named integrations/marketplace connectors, supported third-party telematics vendors, AEMP/ISO 15143-3 conformance statement, import/export file specification, or connector certification program.

**Research conclusion:** API/integration is a verified product capability but remains a **sales/professional-services interface**, not a publicly documented developer surface, based on public evidence available at the cut-off.

## Security, privacy, and compliance statements

### Device and transport facts

- Sapphire states TLS 1.2 for both cellular and Wi-Fi traffic, private APNs, disabled Android root, and encrypted portal passwords.[9]
- Onyx product material claims secure/encrypted Cloud infrastructure and authorized-user access, while the migration program introduces SSO and modern authentication.[2][3]
- Sapphire Wi-Fi supports 802.11a/b/g/n/ac at 2.4/5 GHz and lists WPA, WPA2, WEP-64, and WEP-128.[9]

### Certification/conformity claims

- Onyx V4 lists CE/RED, FCC, PTCRB, RoHS, UL/ULC, and EE.[6][7]
- Sapphire V2SC lists FCC/IC, CE, UL (E/EE/LPS), RoHS, MIL standard/MIL-STD-810G, ISO 7637, SAE J1455, IP67, E-Mark, and RED.[8]
- These are vendor statements in product sheets. Public certificates, declaration-of-conformity identifiers, test reports, certification numbers, and scope/variant mappings were not found in the reviewed materials.

### Privacy facts and boundary

- The 2026 privacy notice is principally a **website/communications/webshop** notice, not a complete Cloud-service privacy/security specification.[15]
- It states GemOne can be a processor for customer employee data, with the customer remaining controller; details depend on the client agreement.[15]
- It describes EEA-first processing, possible international transfers under adequacy or EC Standard Contractual Clauses, need-to-know access, and GDPR rights.[15]
- Sapphire's guide says the device sends a translated credential code rather than the operator's name; the database links that code to the operator name and also stores portal-user emails and encrypted passwords.[9]

### Security unknowns

- No public SOC 2 report, ISO/IEC 27001 certificate, penetration-test summary, vulnerability-disclosure policy, SBOM, secure-development lifecycle, encryption-at-rest specification, key-management design, MFA requirements, session policy, breach-notification SLA, or subprocessor list was found.
- TLS 1.3 support, certificate pinning, mutual TLS, firmware signing, secure boot, over-the-air update security, password hashing algorithm, credential rotation, and mobile/device patch cadence are undisclosed.
- WEP support is documented even though it is obsolete; whether it is enabled by default or retained only for legacy deployments is unknown.[9]

## Release and version stream

### Verified timeline

| Public artifact/event | Date/version evidence | Finding |
|---|---|---|
| New products for 2024 | Article published 2024-01-08.[16] | Introduced public 2024 product direction including connectors/accessories and platform capabilities. |
| GemOne Cloud public article | Article published 2024-10-01.[18] | Positions Cloud as the new consolidated IoT fleet platform. |
| Onyx V4 launch article | Article published 2025-01-27.[17] | Presents Onyx V4 as new, with 4G, high-voltage, IP67, integration, and fleet-management improvements. |
| Cloud portal short guide | “Version 1 – May 2025.” | Public operator/checklist administration guide. |
| Sapphire Wi-Fi guide | “Version 1.2 – April 2025.”[9] | Public network/security setup baseline. |
| Sapphire camera guide | “Version 1.4 – June 2026.”[13] | Current camera installation/operation baseline reviewed here. |
| Current Onyx V4 install guide | Public URL under `/2026/08/`, revision token `DD4`.[7] | Latest English EMEA guide found in public media inventory. |
| Current Sapphire hardware guide | Public URL under `/2026/07/`, revision token `S08`.[19] | Latest English hardware guide found via public install/media materials. |
| Legacy Sapphire → Cloud migration | Migrations February–September 2026.[2] | One year of history migrates automatically; older data remains indefinitely in read-only Sapphire portal. |

### Release-management interpretation

- GemOne publishes many revision-coded PDFs (`Sxx`, `DDx`) and replacement uploads, but no public software/firmware changelog or semantic-versioned release-notes stream was found. Upload path/revision token should be treated as document-release evidence, **not** proof of firmware or SaaS release version.
- The migration page is the strongest public platform-release artifact because it names the rollout window, operational behavior, feature changes, and historical-data handling.[2]

## Contradictions and ambiguities

1. **AI camera detection-zone configuration.** The April 2026 comparison says the Series 2 detection zone can be customized and can cycle through predefined zones.[12] The June 2026 camera guide says the approximately 25 ft/8 m detection range is fixed and cannot be changed.[13] These statements may distinguish zone shape/preset from maximum range, but the public docs do not explain that distinction.
2. **“Nothing personal” wording.** The Wi-Fi guide says no operator name is transmitted by the device and then says a translated credential code is stored and linked to the operator's name; it also acknowledges portal-user emails and encrypted passwords.[9] The defensible interpretation is data minimization on the device uplink, not absence of personal data in the service.
3. **Universal compatibility versus bespoke setup.** Marketing says any make/model and any provider tracker; technical content says deep CAN functionality needs bespoke setup, machine-specific instructions, and adapters.[1][3][7] Basic tracking may be universal while deep diagnostics are not.
4. **“Real-time” versus “near real-time.”** Product pages sometimes say real-time; Cloud brochures use near real-time.[1][3][10] No latency SLA resolves this.
5. **Certification shorthand.** Guides list broad labels such as CE/RED, UL/ULC, EE, and “MIL Standard,” but do not map each claim to product variant, market, certificate, or test report.[6][8][14]
6. **Data-history language.** Migration says customers will not lose data, yet only one year is moved into Cloud; older history remains in a separate legacy read-only portal.[2] The data is retained, but not consolidated into the new platform.

## Priority open questions for technical diligence

### API/integration

1. Provide OpenAPI/schema documentation, authentication method, scopes, tenant isolation, pagination/rate limits, webhook/event semantics, and version/deprecation policy.
2. Which objects and telemetry are exposed (assets, positions, CAN signals, sessions, operators, impacts, checklists, maintenance, media), and what are timestamps, units, and retention?
3. Is usage billing a native API workflow, export, or professional-services integration?[5]
4. Is AEMP/ISO 15143-3 supported? Which versions and fields? Which third-party providers/connectors are certified?
5. Are APIs inbound, outbound, or bidirectional? Are sandbox/test tenants available?

### Architecture/operations

6. Cloud hosting provider, regions, data residency, HA/DR, backups, RPO/RTO, SLA, and support/escalation model.
7. Offline behavior, device buffering, synchronization ordering, duplicate handling, clock synchronization, and OTA configuration/firmware mechanisms.
8. SSO protocol (SAML/OIDC), MFA, RBAC model, audit logs, SCIM/user lifecycle, and service accounts.

### Security/privacy

9. Encryption at rest and key management; TLS 1.3/mTLS/certificate pinning; password hashing; firmware signing/secure boot; vulnerability management; penetration testing; SBOM; subprocessor list.
10. Cloud telemetry retention, operator/credential pseudonymization, video ownership/retention/export, international transfer locations, and DPA terms.
11. Rationale and controls for WEP support; Android 9 patch/update strategy.[9]
12. Evidence behind device regulatory/certification claims by model/region.

### Hardware/release

13. Exact matrix of Onyx/Sapphire variants, cellular band/SIM/eSIM provisioning by geography, connector/adaptor library, supported CAN profiles, and CAN signal licensing.
14. Formal SaaS, firmware, Android-app, and hardware changelogs; end-of-support and backwards-compatibility policies.
15. Clarify AI-camera configurable zone versus fixed range and video storage/overwrite/export behavior.[12][13]

## Structured source register

| ID | Source | Type/date | Technical value | Limitations |
|---:|---|---|---|---|
| 1 | GemOne Cloud[1] | Product page; current at cut-off | Platform features, normalization, integrations, third-party trackers | Marketing-level; no schemas/protocols |
| 2 | Cloud migration[2] | Rollout page; Feb–Sep 2026 program | SSO/API feature direction, migration behavior, data-history split | Customer-specific implementation details omitted |
| 3 | Onyx[3] | Product page | Use cases, CAN caveat, integration targets, hardware positioning | Marketing-level |
| 4 | Sapphire[4] | Product page | Safety/fleet functions and add-ons | Marketing-level |
| 5 | System comparison[5] | PDF; `/2026/06/` | Portfolio boundary and API billing claim | Matrix does not expose API design |
| 6 | Onyx V4 specifications[6] | PDF; `/2026/02/`, `DD3` | Electrical, cellular, GNSS, buses, I/O, certifications | US-formatted sheet; certification proof absent |
| 7 | Onyx V4 installation guide[7] | PDF; `/2026/08/`, `DD4` | Pinout, interfaces, RFID, relays, sleep/data behavior, compatibility | Installation guide, not protocol/API spec |
| 8 | Sapphire V2SC specifications[8] | PDF; `/2026/08/`, `DD4` | Display, voltage, radios, certifications, accessories | Americas sheet; some table labels are visually compressed |
| 9 | Sapphire Wi-Fi guide[9] | PDF; v1.2, Apr 2025 | Strongest architecture/security source: TLS, TCP host/port, bidirectional messages, Android/APN/root | Exposes legacy WEP and Android 9; not Cloud API doc |
| 10 | Cloud brochure[10] | PDF; `/2025/08/`, `S06_1` | Near-real-time flow and multi-provider/business-system claims | Marketing brochure |
| 11 | Product range 2025 EMEA[11] | PDF; `/2025/06/`, `S02_2` | Cross-product compatibility/features and integration targets | 2025 snapshot, not full 2026 catalog |
| 12 | Series 2 AI camera comparison[12] | PDF; `/2026/04/`, `S05` | Series comparison and configurable-zone claim | Marketing comparison |
| 13 | Sapphire camera guide[13] | PDF; v1.4, Jun 2026 | Installation, SD storage, recording, detection behavior | Apparent zone/range ambiguity with source 12 |
| 14 | BMS installation guide[14] | PDF; `/2026/06/`, `S05_` | Voltage variants, sensors, radios, GNSS, CAN limitation | Certification detail incomplete |
| 15 | Website privacy notice[15] | PDF; 2026 | Controller/processor roles, transfers, rights, security principles | Website/communications scope, not full SaaS DPA/security whitepaper |
| 16 | New products for 2024[16] | Article; 2024-01-08 | Product/release chronology | Announcement, not release notes |
| 17 | Onyx V4 introduction[17] | Article; 2025-01-27 | Onyx V4 release chronology | Marketing article |
| 18 | Cloud IoT platform article[18] | Article; 2024-10-01 | Cloud public introduction, feature/integration positioning | Marketing article |
| 19 | Install/manuals page[19] | Public document hub | Discovery point for current public manuals/revisions | Not a changelog |
| 20 | What is telematics[20] | Educational article; 2022-07-29 | AEMP/API industry context | Does not prove GemOne AEMP support |

## Method and confidence

- Crawled GemOne's public sitemap and unauthenticated WordPress REST content/media endpoints; reviewed 68 pages, 30 posts, and 656 public media records.
- Downloaded and text-extracted 17 high-value public PDFs covering current specifications, installation, Wi-Fi/data flow, Cloud, cameras, BMS, product range, and privacy.
- Ran public indexed-web searches for GemOne API/developer/OpenAPI/Swagger/SDK/release materials and reviewed the public install/document hub.
- **Confidence:** High for hardware specifications and explicitly documented Sapphire data flow; medium for portfolio/integration capabilities because many sources are product collateral; low for API mechanics, Cloud architecture, and SaaS security controls because public technical documentation was not found.

## Sources

[1] https://www.gemone.com/gemone-cloud — GemOne Cloud
[2] https://www.gemone.com/migration — GemOne Cloud migration
[3] https://www.gemone.com/onyx — Onyx
[4] https://www.gemone.com/sapphire — Sapphire
[5] https://www.gemone.com/wp-content/uploads/2026/06/GemOne-Comparison-Sheet.pdf — GemOne system comparison
[6] https://www.gemone.com/wp-content/uploads/2026/02/Spec-sheets-4G-CAN-Letter-US-DD3.pdf — Onyx V4 technical specifications
[7] https://www.gemone.com/wp-content/uploads/2026/08/EN-GemOne-GEM-OXV4-installation-guide-EMEA-DD4.pdf — Onyx V4 installation guide
[8] https://www.gemone.com/wp-content/uploads/2026/08/Spec-sheets-Sapphire-V2SC-AMERICAS_DD4.pdf — Sapphire V2SC technical specifications
[9] https://www.gemone.com/wp-content/uploads/2025/07/EN-GemOne-Sapphire-V2SC-wifi_S02.pdf — Sapphire V2SC Wi-Fi setup
[10] https://www.gemone.com/wp-content/uploads/2025/08/GemOne-2_4pager-Cloud_S06_1.pdf — GemOne Cloud brochure
[11] https://www.gemone.com/wp-content/uploads/2025/06/Product-Range-2025-EMEA-S02_2.pdf — GemOne product range 2025 EMEA
[12] https://www.gemone.com/wp-content/uploads/2026/04/AI-camera-comparison-sheet-S05.pdf — Series 2 AI camera comparison
[13] https://www.gemone.com/wp-content/uploads/2026/06/EN-GemOne-Sapphire-V2SC-cameras_S05.pdf — Sapphire V2SC cameras guide v1.4
[14] https://www.gemone.com/wp-content/uploads/2026/06/EN-GemOne-BMS-installation-guide-S05_.pdf — GemOne BMS installation guide
[15] https://www.gemone.com/wp-content/uploads/2026/05/Website-privacy-notice-GemOne-2026.pdf — GemOne website privacy notice 2026
[16] https://www.gemone.com/material-handling/gemones-new-products-for-2024 — GemOne new products for 2024
[17] https://www.gemone.com/material-handling/5-ways-the-new-onyx-v4-tracker-gives-rental-and-construction-fleets-a-competitive-edge-in-fleet-management — Onyx V4 introduction
[18] https://www.gemone.com/cloud-iot-platform — GemOne Cloud IoT platform article
[19] https://www.gemone.com/install — GemOne install and manuals page
[20] https://www.gemone.com/material-handling/what-is-telematics-definition-what-are-telematics — What is telematics
