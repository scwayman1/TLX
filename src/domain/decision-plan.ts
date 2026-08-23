import { DEMO_CLOCK_ISO, SYNTHETIC_PERSONA } from './demo-fixture'
import type { Investigation, TimelineEvent } from './investigation'

export type DecisionPlanOptionId = 'expedite' | 'reschedule'

export type DecisionPlanOption = {
  id: DecisionPlanOptionId
  label: string
  tradeOff: string
  evidenceSummary: string
  confidence: 'High' | 'Medium' | 'Low'
  quoteFreshness: string
}

export type DecisionPlanEvent = {
  id: string
  optionId: DecisionPlanOptionId
  rationale: string
  actorId: string
  workOrderIntentId: string
  occurredAt: string
  idempotencyKey: string
}

export type SafeResponsePlan = {
  options: DecisionPlanOption[]
  selectedOptionId?: DecisionPlanOptionId
  reservationExecuted: boolean
  boundaryStatement?: string
  events: DecisionPlanEvent[]
}

export type DecisionPlanCommand = {
  optionId: DecisionPlanOptionId
  rationale: string
  actorId: string
  workOrderIntentId: string
  idempotencyKey: string
}

export type RecordedDecisionPlan = {
  decisionPlan: SafeResponsePlan
  events: DecisionPlanEvent[]
}

// Typed domain errors: every failure class in this flow has a finite code so
// the UI can route it to the correct accessible region and nothing escapes as
// an untyped error.
export type DecisionPlanErrorCode =
  | 'invalid_idempotency_key'
  | 'unknown_option'
  | 'rationale_required'
  | 'authorization_denied'
  | 'idempotency_conflict'
  | 'audit_integrity'

export class DecisionPlanError extends Error {
  readonly code: DecisionPlanErrorCode
  constructor(code: DecisionPlanErrorCode, message: string) {
    super(message)
    this.name = 'DecisionPlanError'
    this.code = code
  }
}

// Canonical idempotency-key grammar: `decision:<workOrderIntentId>:<label>`
// with an ASCII-only label. The embedded work-order ID must match the
// command's work-order intent, so a key can never be replayed against a
// different work order. The restricted charset makes `decision-<key>` event
// IDs injective with no encoding step (nothing left to throw URIError).
const IDEMPOTENCY_KEY_PATTERN = /^decision:(WO-[0-9]{1,10}):([a-z0-9][a-z0-9-]{0,62})$/

function validateIdempotencyKey(idempotencyKey: string, workOrderIntentId: string): void {
  const match = IDEMPOTENCY_KEY_PATTERN.exec(idempotencyKey)
  if (!match) {
    throw new DecisionPlanError('invalid_idempotency_key', 'Idempotency key must match decision:<WO-id>:<lowercase-label>')
  }
  if (match[1] !== workOrderIntentId) {
    throw new DecisionPlanError('invalid_idempotency_key', 'Idempotency key names a different work order than the command')
  }
}

// The canonical option set and the approver policy are frozen module fixtures,
// deliberately outside any caller-mutable plan or event state: tampering with
// a plan's options can neither invent an option nor authorize a different
// actor. This is synthetic demo policy only — NOT production authentication,
// authorization, or RBAC.
const CANONICAL_OPTION_IDS: readonly DecisionPlanOptionId[] = Object.freeze(['expedite', 'reschedule'])

const SYNTHETIC_APPROVER_POLICY: Readonly<Record<DecisionPlanOptionId, string>> = Object.freeze({
  expedite: SYNTHETIC_PERSONA.actorId,
  reschedule: SYNTHETIC_PERSONA.actorId,
})

export function authorizedApproverIdFor(optionId: DecisionPlanOptionId): string {
  if (!Object.hasOwn(SYNTHETIC_APPROVER_POLICY, optionId)) {
    throw new DecisionPlanError('unknown_option', `Unknown decision-plan option: ${String(optionId)}`)
  }
  return SYNTHETIC_APPROVER_POLICY[optionId]
}

function validateOptionAndAuthorization(state: SafeResponsePlan, command: DecisionPlanCommand): void {
  const isCanonical = CANONICAL_OPTION_IDS.includes(command.optionId)
  const isPresent = state.options.some(option => option.id === command.optionId)
  if (!isCanonical || !isPresent) {
    throw new DecisionPlanError('unknown_option', `Unknown decision-plan option: ${String(command.optionId)}`)
  }
  const approverId = authorizedApproverIdFor(command.optionId)
  if (command.actorId !== approverId) {
    throw new DecisionPlanError('authorization_denied', `Actor ${command.actorId} is not the authorized synthetic approver for option ${command.optionId}`)
  }
}

const BOUNDARY_STATEMENTS: Record<DecisionPlanOptionId, string> = {
  expedite: 'Reservation/purchase not executed · no supplier was contacted',
  reschedule: 'Deployment reschedule recorded in the synthetic workspace only',
}

// Event IDs are `decision-<key>`: a fixed prefix over the validated key
// charset, so distinct keys can never collide on one event ID.
const eventIdForKey = (idempotencyKey: string) => `decision-${idempotencyKey}`

// The ledger is caller-held state, so it is never trusted implicitly: every
// event must be a command this module could itself have accepted — canonical
// ID and key, canonical option, authorized actor, non-empty rationale, and
// the fixed demo clock — and IDs must be unique across the whole ledger.
function validateLedgerEvent(event: DecisionPlanEvent): void {
  validateIdempotencyKey(event.idempotencyKey, event.workOrderIntentId)
  if (event.id !== eventIdForKey(event.idempotencyKey)) {
    throw new DecisionPlanError('audit_integrity', `Event ${event.id} does not match its canonical identity`)
  }
  if (!CANONICAL_OPTION_IDS.includes(event.optionId)) {
    throw new DecisionPlanError('unknown_option', `Unknown decision-plan option: ${String(event.optionId)}`)
  }
  if (event.actorId !== authorizedApproverIdFor(event.optionId)) {
    throw new DecisionPlanError('authorization_denied', `Actor ${event.actorId} is not the authorized synthetic approver for option ${event.optionId}`)
  }
  if (!event.rationale.trim()) {
    throw new DecisionPlanError('rationale_required', 'Decision rationale is required')
  }
  if (event.occurredAt !== DEMO_CLOCK_ISO) {
    throw new DecisionPlanError('audit_integrity', `Event ${event.id} does not carry the fixed demo-clock timestamp`)
  }
}

function validateLedgerIntegrity(events: DecisionPlanEvent[]): void {
  const seen = new Set<string>()
  for (const event of events) {
    validateLedgerEvent(event)
    if (seen.has(event.id)) {
      throw new DecisionPlanError('audit_integrity', `Duplicate decision event ID in ledger: ${event.id}`)
    }
    seen.add(event.id)
  }
}

export function createSafeResponsePlan(): SafeResponsePlan {
  return {
    options: [
      {
        id: 'expedite',
        label: 'Expedite the quoted BA-14TL assembly',
        tradeOff: 'Fastest path to deployment tomorrow, but commits budget and depends on one vendor quote',
        evidenceSummary: 'Desert Fleet Supply synthetic lookup: 1 assembly available, delivery tomorrow by 10:30 AM',
        confidence: 'Medium',
        quoteFreshness: 'One synthetic quote captured during this investigation; verify before commitment',
      },
      {
        id: 'reschedule',
        label: 'Reschedule the Northstar deployment',
        tradeOff: 'No spend or vendor dependency now, but the deployment slips and the asset stays out of service',
        evidenceSummary: 'Dispatch schedule shows the trailer is assigned to tomorrow’s mobilization',
        confidence: 'High',
        quoteFreshness: 'Schedule evidence observed 2026-08-21T14:20:00Z',
      },
    ],
    reservationExecuted: false,
    events: [],
  }
}

export function recordDecisionPlan(state: SafeResponsePlan, command: DecisionPlanCommand): RecordedDecisionPlan {
  validateIdempotencyKey(command.idempotencyKey, command.workOrderIntentId)
  validateOptionAndAuthorization(state, command)
  const rationale = command.rationale.trim()
  if (!rationale) throw new DecisionPlanError('rationale_required', 'Decision rationale is required')

  // Replay is revalidated command acceptance, never a lookup shortcut: every
  // check above already ran, and the ledger itself is validated before any
  // event is trusted as a prior acceptance.
  validateLedgerIntegrity(state.events)
  const id = eventIdForKey(command.idempotencyKey)
  const prior = state.events.find(item => item.idempotencyKey === command.idempotencyKey)
  if (prior) {
    const samePayload = prior.optionId === command.optionId
      && prior.rationale === rationale
      && prior.actorId === command.actorId
      && prior.workOrderIntentId === command.workOrderIntentId
    if (!samePayload) {
      throw new DecisionPlanError('idempotency_conflict', 'Idempotency key replayed with a different payload')
    }
    // Exact replay: a no-op on the ledger, but the returned plan is as fully
    // populated as the original acceptance was.
    return {
      decisionPlan: {
        ...state,
        selectedOptionId: prior.optionId,
        reservationExecuted: false,
        boundaryStatement: BOUNDARY_STATEMENTS[prior.optionId],
      },
      events: state.events,
    }
  }
  if (state.events.some(item => item.id === id)) {
    throw new DecisionPlanError('audit_integrity', `Duplicate decision event ID rejected: ${id}`)
  }
  const event: DecisionPlanEvent = {
    id,
    optionId: command.optionId,
    rationale,
    actorId: command.actorId,
    workOrderIntentId: command.workOrderIntentId,
    occurredAt: DEMO_CLOCK_ISO,
    idempotencyKey: command.idempotencyKey,
  }
  const events = [...state.events, event]
  return {
    decisionPlan: {
      ...state,
      selectedOptionId: command.optionId,
      reservationExecuted: false,
      boundaryStatement: BOUNDARY_STATEMENTS[command.optionId],
      events,
    },
    events,
  }
}

// Operating Memory integration: reconciles the decision ledger into the
// investigation timeline. Every event is validated before it is trusted,
// integration is idempotent (re-running is a no-op), and either every
// unintegrated event lands deterministically in ledger order or the whole
// call fails closed — a ledger is never silently truncated to its last event.
export function integrateDecisionEvents(investigation: Investigation, events: DecisionPlanEvent[]): Investigation {
  // Same fail-closed validation the record path applies, including uniqueness
  // WITHIN this batch — a ledger carrying duplicate IDs is corrupt and is
  // never partially integrated.
  validateLedgerIntegrity(events)

  const existingById = new Map(investigation.timeline.map(item => [item.id, item]))
  const additions: TimelineEvent[] = []
  for (const event of events) {
    const timelineId = `decision.recorded-${event.id}`
    const entry: TimelineEvent = {
      id: timelineId,
      kind: 'decision.recorded',
      label: `Decision recorded: ${event.optionId} · ${event.workOrderIntentId} · ${event.rationale} · event ${event.id}`,
      actorId: event.actorId,
      occurredAt: event.occurredAt,
    }
    const existing = existingById.get(timelineId)
    if (existing) {
      if (existing.kind !== entry.kind || existing.label !== entry.label || existing.actorId !== entry.actorId || existing.occurredAt !== entry.occurredAt) {
        throw new DecisionPlanError('audit_integrity', `Timeline entry ${timelineId} already exists with different content`)
      }
      continue
    }
    additions.push(entry)
  }
  if (additions.length === 0) return investigation
  return { ...investigation, timeline: [...investigation.timeline, ...additions] }
}
