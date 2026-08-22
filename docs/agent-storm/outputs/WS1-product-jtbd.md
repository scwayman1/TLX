# WS1 — Product, JTBD, and Customer-Evidence Brief Contribution

**Workstream:** WS1 — Product, jobs, and customer evidence  
**Linear context:** SCO-14, SCO-16  
**Prepared:** 2026-08-22  
**Evidence boundary:** Public material, the authorized synthetic AssetPro demo checkpoint, redacted safety checkpoints, repository documentation, and the current synthetic TelemetryX application only. No customer is claimed, and no PHX/Kenco customer data is used as workflow validation.

## 1. Decision this brief supports

**Decision:** Which single fleet-management job should Discovery Tranche 01 demonstrate and validate before broader product work proceeds?

**Recommendation:** Keep the tranche focused on **exception-to-safe-plan coordination** for a **fleet manager / operational supervisor accountable for asset availability and safe return to service**. The first validation should test whether a unified, evidence-grounded thread helps that person move a safety-critical asset exception from ambiguous signal to an owned, feasible response plan with fewer context-losing handoffs.

This is a learning decision, not a claim of product-market fit. Product owner approval is required to promote the recommendation into the tranche success contract.

## 2. Executive product truth

### Facts

1. The tranche handoff already names a fleet manager or operational supervisor as the primary user and defines the job as moving an ambiguous asset exception to verified resolution without losing context, ownership, safety boundaries, or evidence.[E1]
2. The tranche decision log has selected exception-to-resolution fleet coordination as the primary demo job, subject to reconsideration if customer evidence reveals a higher-value job or the slice cannot be made coherent.[E2]
3. TelemetryX's stated operating loop is Sense → Prioritize → Decide → Execute → Verify, connecting asset state, work orders, parts, assignments, evidence, and audit.[E3]
4. The authorized AssetPro demo exposed asset alarms/status, safety incidents, maintenance states, inventory/device data, people, reports, and support workflows, but did not provide measured user frequency, task time, handoff count, or realized outcome data.[E4]
5. GemOne's public material documents telemetry-to-action workflows spanning safety/access, impacts, checklists, maintenance, utilization, alerts, and reports. Named vendor case studies support workflow relevance but do not provide independent or directly transferable proof of TelemetryX customer demand.[E5]
6. The current TelemetryX app presents a synthetic safety-critical brake exception, grounded evidence, an explicit decision owner, a proposed external lookup requiring approval, and an operating timeline.[E6]
7. The current app stops at a synthetic vendor-availability result and a “Prepare action plan” preview. It does not yet demonstrate inventory reservation, work assignment, repair verification, or safe return-to-service completion in the rendered journey.[E6]
8. SCO-14 and SCO-16 contain no associated customer needs, attachments, documents, or participant evidence at the time of review.[E8][E9]
9. PHX and Kenco were correctly stopped at a read-only safety gate because their surfaces appeared customer-derived or operational. They establish safety constraints, not validated customer workflow, frequency, or demand.[E10][E11]

### Interpretations

1. **The strongest persona is the accountable fleet manager / operational supervisor, not the technician.** The chosen job crosses signal triage, operational impact, maintenance ownership, parts feasibility, and return-to-service authorization. A technician is critical to execution but is unlikely to own the entire cross-functional outcome.
2. **The valuable unit is the resolved exception, not the dashboard or AI interaction.** Dashboards, telemetry, agent interpretation, work orders, and inventory are enabling steps. The buyer/user value hypothesis is reduced operational exposure and coordination loss.
3. **The current demo is strongest through “ready for decision,” not through resolution.** It credibly shows provenance and approval boundaries but currently overstates the README promise if narrated as reserving inventory and verifying return to service.
4. **Public/legacy breadth establishes category plausibility, not priority.** A feature existing in AssetPro or GemOne does not prove that a representative TelemetryX user values it or experiences the proposed pain.

### Core hypothesis

> For fleet managers or operational supervisors who must protect fleet availability and safety, when a high-priority asset exception threatens planned work, TelemetryX will help them assemble trustworthy evidence, establish ownership, and choose a feasible safe response faster and with fewer context-losing handoffs than their current workflow—without allowing the agent to take consequential action autonomously.

### Principal risks

- **Demand risk:** no representative-user evidence yet proves frequency, severity, dissatisfaction, or willingness to change.
- **Persona risk:** the true end-to-end owner may be a maintenance coordinator, branch manager, dispatcher, or shared incident team rather than a fleet manager.
- **Outcome risk:** “faster resolution” may be dominated by physical repair and supplier lead time; software may only improve triage or planning time.
- **Trust risk:** stale, partial, or conflicting telemetry may make an apparently unified view less trustworthy than current specialist systems.
- **Adoption risk:** the workflow may require integrations, role enforcement, or data quality that the synthetic demo cannot represent.
- **Scope-credibility risk:** claiming reservation or verified return to service before those steps are demonstrated will erode trust.

## 3. Target persona and job contract

### Primary target persona — proposed for validation

**Role:** Fleet manager or operational supervisor accountable for a site/region's equipment availability and safe deployment.

**Accountabilities:**

- Maintain sufficient ready assets for scheduled work.
- Triage asset exceptions by safety, operational impact, and timing.
- Coordinate maintenance, dispatch/operations, and parts/vendor response.
- Assign or confirm a human decision owner.
- Prevent unsafe deployment and establish the conditions for return to service.
- Explain what happened, why a decision was made, and who approved it.

**Situation:** A safety, inspection, maintenance, or telemetry signal threatens a near-term assignment and requires coordination across records or teams.

**Functional job:**

> When a high-priority asset exception threatens safe operations or a committed deployment, help me determine what is true, what the impact is, who owns the response, and what feasible action should happen next, so I can establish a safe plan and restore availability without losing evidence or accountability.

**Emotional job hypothesis:** Feel confident that the plan is based on current evidence and that no unsafe or unauthorized action is occurring invisibly.

**Social job hypothesis:** Be able to explain the decision to operations leadership, safety, maintenance, and the customer/client without reconstructing the story manually.

### Secondary participants (not alternate primary personas)

| Participant | Contribution to the job | Validation need |
|---|---|---|
| Maintenance coordinator / planner | Converts exception into work, schedule, assignment, and parts needs | Does this role actually own the thread after triage? |
| Technician | Diagnoses/repairs and supplies completion evidence | What evidence is required before return to service? |
| Dispatcher / site operations lead | Describes assignment impact and alternatives | Who quantifies client/schedule impact? |
| Parts or procurement coordinator | Confirms stock, reservation, vendor, lead time, and cost | Is parts coordination a frequent material bottleneck? |
| Safety/compliance lead | Defines hold, approval, and audit requirements | Which exceptions require separation of duties? |

### Explicit non-targets for this tranche

- Executive portfolio reporting as the primary job.
- Generic asset browsing or legacy feature parity.
- Autonomous maintenance decisions or device commands.
- Billing, scheduled report sending, or customer communications.
- Full technician execution UX.
- Production integration or deployment readiness.

## 4. Current workflow and pain hypotheses

The sequence below is a **testable workflow hypothesis**, not an observed customer journey.

| Step | Current-workflow hypothesis | Pain / failure hypothesis | Existing evidence | Confidence | What must be learned |
|---|---|---|---|---|---|
| 1. Detect | An alarm, failed inspection, maintenance signal, operator report, or dispatch conflict surfaces | Signals arrive in different systems/channels; freshness and authority are unclear | AssetPro exposes alarms, checklists, incidents, PM, device state; GemOne documents similar telemetry-to-action loops.[E4][E5] | Medium on category, low on target users | Most common trigger, weekly/monthly frequency, false positives, authoritative source |
| 2. Triage | A supervisor decides whether the exception is safety-critical and operationally material | Users manually correlate asset status, history, assignment, and timing | TLX synthetic investigation combines four sources; AssetPro separates relevant modules.[E4][E6] | Medium | Actual systems/tabs/messages used; median and worst-case triage time |
| 3. Establish owner | Someone assigns maintenance/operations responsibility and deadline | Ownership may be implicit, duplicated, or lost across handoffs | AssetPro shows owners/assignees across maintenance/support; TLX names a decision owner.[E4][E6] | Low-medium | Who owns from detection through safe plan; how reassignment/escalation works |
| 4. Diagnose / ground | Team confirms defect, recurrence, and supporting evidence | Evidence provenance, timestamps, and contradictions are difficult to reconstruct | AssetPro contains inspection, incident, history, telemetry; TLX labels evidence and inference.[E4][E6] | Medium on available artifacts, low on pain | Which evidence changes the decision; acceptable staleness; common disputes |
| 5. Assess impact | Team checks upcoming assignment, client effect, safety hold, and alternatives | Operational context may not be connected to maintenance evidence | TLX fixture links the trailer to tomorrow's deployment; product scope prioritizes client impact and timing.[E3][E6] | Low | Where schedules live; cost of delay/substitution; who can alter dispatch |
| 6. Build feasible plan | Maintenance scope, technician capacity, parts stock/vendor lead time, and cost are checked | Parts/vendor coordination and approval create delays and repeated contacts | AssetPro exposes maintenance/invoice data; TLX shows no internal stock and a vendor lookup; GemOne cases cite proactive maintenance but not this exact handoff.[E4][E5][E6] | Low-medium | Frequency of parts blockers, channels, reservation semantics, approval thresholds |
| 7. Approve | Accountable person chooses expedite, substitute, reschedule, or hold | Consequential decisions may lack explicit evidence, authority, or recorded rationale | TLX requires approval for synthetic external enrichment; architecture requires human approval/audit for consequential recommendations.[E3][E6] | Medium on desired safety boundary, low on current pain | Which decisions need approval; decision rights; separation of duties |
| 8. Execute / coordinate | Work order, part reservation/order, assignment, and dispatch change are made | Re-keying and system handoffs can create stale or divergent state | Product scope connects work orders, parts, assignments, and evidence; current rendered demo does not complete them.[E3][E6] | Low | Actual systems of record, duplicate entry, failure/retry modes |
| 9. Verify return to service | Repair/inspection evidence is reviewed and hold is cleared | “Completed” may not equal safe/available; proof can be missing | Product scope explicitly requires verification; domain state machine blocks work-order completion until required tasks are complete.[E3][E7] | Medium on intended contract, low on customer need | Required evidence, approver, status propagation, elapsed repair versus coordination time |
| 10. Learn | Timeline supports audit and recurring-pattern review | Context is reconstructed after the fact; recurrence may remain hidden | TLX has an append-style timeline and repeat-defect inference; AssetPro support history may contain product intelligence.[E4][E6] | Medium as design rationale, low as user value | Audit frequency, downstream consumers, recurrence decisions |

### Cost/risk hypotheses to quantify

- Asset downtime or lost availability hours.
- Missed deployment or substitute/rental cost.
- Safety exposure from premature return to service.
- Supervisor/planner labor spent collecting evidence and chasing status.
- Number of handoffs, systems, messages, and duplicate entries.
- Delay attributable to unclear ownership or parts availability.
- Audit/compliance effort after the event.

No numerical baseline for these costs is currently evidenced.

## 5. Demo promise, outcome, and baseline options

### Honest demo promise for the current application

> A fleet manager can open a safety-critical asset exception, inspect source-labeled evidence and confidence-labeled interpretation, see the named decision owner, and approve or reject a synthetic vendor-availability lookup without executing a real command or changing a production system.

### Target tranche promise (requires additional demonstrated behavior)

> A fleet manager can move a high-priority asset exception from signal to an owned, evidence-grounded safe response plan that connects maintenance and inventory feasibility, preserves approval/audit context, and clearly states what remains before return to service—without issuing a real device command.

**Scope correction:** Until the UI demonstrates reservation and completion evidence, do not claim that the user “reserved the required inventory” or “verified resolution.” Say “confirmed sourcing feasibility” and “prepared a safe response plan.”

### Recommended primary outcome

**Primary product outcome:** **Time from first actionable exception signal to an approved safe response plan.**

Why this is stronger than “time to resolution” for this tranche:

- It covers the software-influenceable coordination period.
- It does not confound the demo with physical repair or vendor delivery duration.
- It includes evidence, ownership, feasibility, and approval—not speed alone.
- It can later be paired with safe return-to-service time as an operational lagging outcome.

### Guardrail outcomes

- Required evidence completeness at the approval point.
- Correct identification of decision owner and next owner.
- Zero unsafe/unauthorized action or implied production execution.
- User can distinguish fact, inference, simulation, stale/unknown data, and action state.
- No increase in wrong escalation or premature return-to-service decisions.

### Baseline options

| Option | Definition | Strength | Limitation | Decision use |
|---|---|---|---|---|
| A — Observed current-work baseline (**preferred**) | For 3–5 recent representative exceptions, record elapsed time from first actionable signal to approved plan, systems touched, handoffs, rework, and evidence gaps | Real behavioral comparator | Requires participant access and careful recall/artifact review | Pilot/value decision |
| B — Scenario-based usability baseline | Participant completes the same synthetic scenario first with a neutral “current tools” packet, then with TLX; compare task time, handoffs, omissions, and confidence | Fast and controlled | Artificial; learning/familiarity bias | Demo design decision |
| C — Self-reported baseline | Participant estimates typical/best/worst time, systems, handoffs, and failure consequences | Cheapest discovery input | Recall and social-desirability bias | Hypothesis shaping only |
| D — Rehearsal baseline | Team measures deterministic demo completion and whether required evidence/ownership/approval states are visible | Available without customers | Proves demo operability, not customer value | Tranche readiness only |

### Rehearsal acceptance threshold (not a customer outcome)

A trained presenter can complete the primary path in **5 minutes or less** within the 5–7 minute narrative, with:

1. the safety-critical exception and operational consequence clearly established;
2. every material fact visibly tied to a source and timestamp;
3. inference explicitly separated from fact;
4. one named decision owner and one explicit next owner;
5. no external lookup before human approval;
6. no real device command, purchase, reservation, assignment, or communication implied;
7. sourcing feasibility and unresolved return-to-service conditions stated accurately; and
8. deterministic reset/fallback available.

### Evidence threshold for changing product direction

- **Keep / refine the primary job:** at least 3 representative participants across at least 2 organizations or operating contexts describe materially similar recent exceptions; at least 2 can provide a concrete recent example with current workflow artifacts or detailed reconstruction; and the job is recurring or high-consequence enough to merit active management.
- **Change the persona:** at least 2 recent cases show another role owns detection-to-safe-plan and the fleet manager is only informed/approves.
- **Change the primary outcome:** participants consistently optimize another measurable outcome (for example time-to-owner or evidence completeness) and can explain why time-to-safe-plan is not decision-relevant.
- **Stop / pivot the slice:** representative participants cannot recall the job, rate its consequences as immaterial, already complete it satisfactorily in one trusted system, or reject the proposed cross-functional ownership model.

These thresholds are proposed decision rules; the Product owner is the decider.

## 6. Interview and scenario-test guide

### Participant criteria

Recruit people who, in the last 90 days, personally triaged or coordinated an asset exception affecting safety, availability, or a committed job. Prefer a mix of fleet/site operations and maintenance planning. Do not count sales, executives far from the work, or internal product staff as representative users.

### Session structure (45–60 minutes)

#### A. Context and role (5 minutes)

1. What fleet/site/equipment scope are you responsible for?
2. Which decisions can you make, approve, or only recommend?
3. Who is accountable when an asset cannot safely perform a scheduled job?

#### B. Recent-event reconstruction (15–20 minutes)

Ask for the most recent concrete case, not opinions about features.

1. What was the first signal? Who saw it, where, and when?
2. What made it actionable rather than noise?
3. What did you need to know before deciding what to do?
4. Walk through every system, person, message, spreadsheet, or paper record used.
5. Who owned each step? Where did ownership change?
6. What evidence was missing, stale, contradictory, or mistrusted?
7. How were operational impact and alternatives assessed?
8. How were parts, technician capacity, vendor lead time, and cost checked?
9. Which actions required approval? Who could override or release the asset?
10. What proved the asset was safe and available again?
11. Where was the final rationale/timeline recorded, if anywhere?

Capture frequency, elapsed and active labor time, systems touched, handoffs, delays, rework, downtime, external cost, safety/compliance consequence, and outcome.

#### C. Frequency and importance (5–10 minutes)

1. How often do similar exceptions occur in a typical month? What about severe cases?
2. What is the best, typical, and worst case for time to an approved plan?
3. Which delay is most costly: detecting, assigning, diagnosing, sourcing, approving, repairing, or verifying?
4. What happens when this goes badly? Ask for the last actual consequence.
5. What workaround have you built? What would you never change?

#### D. Scenario usability test (15 minutes)

Give the participant the TLX brake-failure scenario with no leading explanation.

**Task:** “You are responsible for tomorrow's deployment. Determine what is true, decide what should happen next, and tell me what you would need before the asset can return to service. Think aloud.”

Observe without coaching:

- First click and first question.
- Whether they identify safety hold and deployment impact.
- Which sources they inspect and which they ignore.
- Whether fact/inference and freshness are understood.
- Whether they can name the decision owner and next owner.
- Whether they notice the synthetic/external-tool boundary.
- Whether approve/reject semantics match their expectations.
- Whether “vendor availability” is mistaken for reservation/order.
- Whether they can state unresolved return-to-service conditions.
- Time to a defensible plan, hesitations, backtracking, and help needed.

After the task, ask:

1. What did you trust or distrust, and why?
2. What was missing to make the decision?
3. Which presented item was irrelevant?
4. What action did you think had actually occurred?
5. Where should ownership, approval, and audit live?
6. How would this fit or conflict with your systems and roles?
7. What would prevent adoption even if the workflow helped?
8. Would you use this for every exception, only severe ones, or never? Why?

#### E. Adoption and close (5 minutes)

1. Which integration/data source is indispensable for a pilot?
2. What permissions, policy, or labor change would be required?
3. Who must approve purchase, deployment, and workflow change?
4. What measurable result would justify continuing after 30–60 days?
5. May we follow up and, if authorized, retain exact quotes/artifacts?

### Evidence capture record

For each session preserve:

- Participant code (not customer name unless explicitly authorized).
- Role, responsibility scope, fleet/equipment context, and source/recruiting path.
- Date and interviewer.
- Recent event and recency.
- Direct observations versus participant reports.
- Authorized verbatim quotes separately from paraphrase.
- Frequency, time, handoffs, systems, costs/risks, trust failures, and outcome.
- Scenario result and observed behavior.
- Contradictory evidence and confidence.
- Learning, implicated hypothesis, and proposed product change (if any).

Do not convert feature requests directly into roadmap items. Tie every proposed change to an observed job failure and expected measurable improvement.

## 7. Opportunity scorecard

Scales: **Importance / dissatisfaction / frequency / consequence / fit** are 1 (low) to 5 (high). **Evidence confidence** is High/Medium/Low. Scores are hypotheses for prioritizing validation, not market facts.

| Rank | Opportunity | Importance | Dissatisfaction | Frequency | Consequence | TLX fit | Evidence confidence | Decision |
|---:|---|---:|---:|---:|---:|---:|---|---|
| 1 | Build an evidence-grounded, owned safe response plan for a high-priority asset exception | 5 | 4 | 3 | 5 | 5 | Medium category / Low customer | **Primary validation target**; coherent across product scope, legacy/public evidence, and current slice |
| 2 | Preserve provenance, approval, and audit across cross-functional handoffs | 5 | 4 | 3 | 5 | 5 | Medium design evidence / Low customer | Guardrail and differentiator hypothesis; validate trust and audit need |
| 3 | Connect parts/vendor feasibility to the maintenance decision | 4 | 4 | 3 | 4 | 4 | Low-medium | Keep in scenario; learn whether it is a common bottleneck and who owns it |
| 4 | Clarify telemetry freshness, authority, and conflicts before acting | 5 | 3 | 4 | 5 | 4 | Medium category / Low customer | Mandatory trust test; do not hide stale/partial states |
| 5 | Verify completion evidence before safe return to service | 5 | 3 | 3 | 5 | 4 | Medium intended contract / Low customer | Target-state requirement; current rendered journey is incomplete |
| 6 | Detect recurring defect patterns across asset history | 3 | 3 | 2 | 4 | 4 | Low | Secondary learning; do not let it distract from immediate plan |
| 7 | Broad portfolio dashboards and generic AI recommendations | 3 | 3 | 4 | 3 | 2 | Low as unmet need | Defer as primary demo value; retain only if it helps enter the exception |
| 8 | Real device commands from the workflow | 2 | 2 | 2 | 5 | 1 for tranche | Low demand / High risk | Explicitly excluded pending authorization, safety, and production contracts |

### Scorecard interpretation

The top opportunity wins because it combines high consequence with strong coherence to the existing product foundation, not because customer demand is proven. The confidence column is the governing constraint: no item should be promoted from hypothesis to validated opportunity without representative evidence.

## 8. Decisions, proposals, unknowns, and evidence gaps

### Existing tranche decisions

- **D-001:** Primary demo job is exception-to-resolution fleet coordination.[E2]
- **D-002:** Synthetic data only; no production integrations.[E2]
- **D-003:** No real device command is executed or implied.[E2]
- **D-006:** Linear holds commitment/traceability; repository docs hold durable context.[E2]

### WS1 proposed decisions (Product owner approval needed)

| ID | Proposal | Rationale | Reconsideration trigger |
|---|---|---|---|
| WS1-PD-01 | Validate fleet manager / operational supervisor as primary persona; treat maintenance coordinator as the strongest alternative | Best current match to end-to-end availability/safety accountability | Two recent cases show another role owns signal-to-safe-plan |
| WS1-PD-02 | Use time-to-approved-safe-plan as the primary outcome; pair with evidence completeness and unsafe-action guardrails | More controllable and honest than physical time-to-resolution | Users consistently optimize a different outcome |
| WS1-PD-03 | Narrow current-demo language from “resolution/reservation” to “safe plan/sourcing feasibility” until UI proves later states | Avoids presenting synthetic or absent behavior as accomplished | Reservation and verification states are implemented and tested |
| WS1-PD-04 | Require recent-event interviews before claiming customer validation | Existing evidence is category/public/demo evidence only | Never; this is an epistemic guardrail |

### Explicit unknowns

1. Who actually owns the exception from trigger through approved safe plan?
2. How often does this job occur by segment, equipment type, and severity?
3. What are baseline elapsed time, active labor, handoffs, systems touched, rework, and cost/risk?
4. Which signal sources are authoritative, advisory, stale, or disputed?
5. Which exceptions require approval, separation of duties, or safety hold?
6. Is parts/vendor coordination a frequent bottleneck or merely convenient for the demo fixture?
7. What exact evidence is required to release an asset back to service?
8. Which current system is the system of record for work order, inventory, assignment, and audit?
9. What integrations are indispensable for a bounded pilot?
10. What adoption barriers arise from trust, duplicate entry, role boundaries, data quality, training, or policy?
11. Which customer/user segments have the highest job frequency and consequence?
12. Does a representative user interpret the demo's approval as lookup permission only, or as approval of a maintenance/procurement action?

### Evidence gaps by decision

| Decision | Evidence present | Missing minimum evidence | Owner / next action |
|---|---|---|---|
| Primary persona | Internal product direction; category workflow evidence | 3–5 recent-event role maps from representative participants | Product/WS1 — recruit and interview |
| Job importance | Legacy/public workflow breadth; safety/availability logic | Frequency, severity, current dissatisfaction, and consequences | WS1 — recent-event reconstruction |
| Primary metric | Proposed software-influenceable outcome | Current baseline and participant definition of “safe plan” | WS1 — baseline options A/B |
| Workflow design | Current synthetic path and public/legacy entities | Observed current workflow, handoffs, trust failures, adoption fit | WS1/WS2 — moderated scenario tests |
| Parts step | Synthetic fixture; legacy maintenance/invoice surfaces | Actual frequency, owner, reservation semantics, approval/cost threshold | WS1/WS3 — focused probes |
| Return-to-service | Product/architecture intent; work-order invariant | Participant policy/evidence, approver, status propagation | WS1/WS3 — safety/maintenance interviews |
| Pilot readiness | Explicit production gaps | Required integrations, identity/RBAC, support owner, data contract | WS3/WS5 after job validation |
| Customer resonance | None recorded | Representative sessions with traceable observations and authorized quotes | SCO-16 owner — do not fabricate |

## 9. Recommended validation and decision sequence

1. **Approve or amend this job/persona/outcome contract** — Product owner.
2. **Recruit 3–5 representative participants** meeting the recent-event criterion; escalate if access is unavailable.
3. **Run current-event interviews before demo exposure** to avoid anchoring the participant on the proposed workflow.
4. **Establish baseline A where possible; use B/C only with explicit evidence-strength labels.**
5. **Run the synthetic scenario test** and record observed behavior separately from stated preference.
6. **Synthesize by job failure, not feature votes.** Deduplicate corroborated patterns, contradictions, segment differences, and confidence.
7. **Apply the evidence thresholds** to keep/refine, change persona/outcome, or stop/pivot.
8. **Only then authorize demo changes**, each linked to a learning rationale and expected metric effect.

### Decision gate

**Decider:** Product owner.  
**Inputs required:** This brief, session evidence records, baseline summary, scenario-test observations, scorecard update, and unresolved safety/adoption risks.  
**Decision options:** Continue/refine the slice; change persona; change outcome; narrow the workflow; stop/pivot.  
**Current recommendation:** Continue to validation, but make no customer-demand claim and correct the demo promise to match demonstrated states.

## 10. Sources and traceability

Repository line references describe the inspected revision at preparation time.

- **[E1]** `docs/agent-storm/README.md:3-16,29-47` — mission, target user/job/outcome, epistemic and safety boundaries.
- **[E2]** `docs/agent-storm/DECISION-LOG.md:3-19` — decided demo job, synthetic boundary, no device command, decision owners, open persona/outcome choices.
- **[E3]** `docs/PRODUCT_SCOPE.md:3-12,24-49` and `docs/ARCHITECTURE.md:24-32` — operating loop, implemented slice, production gaps, integrity rules.
- **[E4]** `docs/evidence/AP-ENV-DEMO-product-map-checkpoint-2.md:77-229,349-360,379-415` — authorized demo capabilities, cross-cutting risks, unknowns, and evidence plan.
- **[E5]** `docs/evidence/GemOne-public-product-technical-market-assessment.md:17-33,55-61,71-88,101-105` — public portfolio/workflows, named vendor case studies, strategic implications, and evidence confidence. The assessment's own source register provides external URLs.
- **[E6]** `src/App.tsx:96-127,136-152` and `src/domain/investigation.ts:44-74` — current synthetic mission-control exception, investigation, evidence, approval, tool result, domain queues, and missing rendered completion steps.
- **[E7]** `src/domain/work-orders.ts:18-46` and `src/domain/inventory.ts:26-58` — synthetic audited state transitions, required-task completion guard, idempotent inventory issue logic (not a claim that these are integrated into the rendered journey).
- **[E8]** Linear [SCO-14](https://linear.app/telemetry-x/issue/SCO-14/tranche-publish-product-discovery-brief-and-demo-success-contract) — brief outcome/acceptance and empty customer-needs list at review.
- **[E9]** Linear [SCO-16](https://linear.app/telemetry-x/issue/SCO-16/validation-run-customeroperator-evidence-loop-against-the-demo) — validation acceptance and empty customer-needs list at review.
- **[E10]** `docs/evidence/AP-ENV-PHX-redacted-safety-checkpoint.md:1-27` — read-only safety stop; not customer-validation evidence.
- **[E11]** `docs/evidence/AP-ENV-KENCO-redacted-safety-checkpoint.md:1-30` — read-only safety stop; not customer-validation evidence.

## 11. Handoff

- **WS2:** Use the target job and observed-test criteria to make every screen/action advance the safe-plan outcome; add explicit stale/partial/permission/action-state semantics.
- **WS3:** Define the owner/approval, evidence, work-order, inventory feasibility/reservation, and return-to-service contracts without assuming current customer semantics.
- **WS4:** Do not expand product breadth. Close only the smallest journey gap that validation shows matters.
- **WS7:** Narrate sourcing feasibility and an owned safe plan, not completed reservation or verified resolution, unless those states become demonstrably true.
- **Product/SCO-16:** Recruit representative participants or explicitly close the tranche with customer evidence unavailable and all demand claims remaining hypotheses.
