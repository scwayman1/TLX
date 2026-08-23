import { DEMO_CLOCK_ISO, SYNTHETIC_ACTIVE_ACTOR_ID } from './investigation'

export type DecisionPlanOptionId = 'expedite' | 'reschedule'
export type DecisionPlanOption = {
  id: DecisionPlanOptionId
  label: string
  tradeOff: string
  evidenceSummary: string
  confidence: 'High' | 'Medium' | 'Low'
  quoteFreshness: string
  requiredApprover: string
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
export type SafeResponsePlanState = {
  options: DecisionPlanOption[]
  selectedOptionId?: DecisionPlanOptionId
  reservationExecuted: boolean
  boundaryStatement?: string
  events?: DecisionPlanEvent[]
}
export type DecisionPlanCommand = {
  optionId: DecisionPlanOptionId
  rationale: string
  actorId: string
  workOrderIntentId: string
  idempotencyKey: string
}

export type SafeResponsePlan = SafeResponsePlanState
export type RecordedDecisionPlan = {
  decisionPlan: SafeResponsePlanState
  events: DecisionPlanEvent[]
}

// Typed domain error so validation, authorization, idempotency-conflict, and
// audit-integrity failures are distinguishable at the control/region that
// handles them. Unexpected integrity failures must fail visibly, not masquerade
// as selection errors.
export type DecisionPlanErrorCode =
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

// Immutable trusted synthetic approver policy — a demo fixture constant,
// deliberately independent of any plan payload or caller-mutable state.
// It authorizes the same single explicit synthetic active actor used across
// the whole demo flow (no hidden substitution between display and record).
// This is synthetic policy only: it is NOT production authentication or RBAC.
const SYNTHETIC_APPROVER_POLICY: Readonly<Record<DecisionPlanOptionId, string>> = Object.freeze({
  expedite: SYNTHETIC_ACTIVE_ACTOR_ID,
  reschedule: SYNTHETIC_ACTIVE_ACTOR_ID,
})

export function authorizedApproverIdFor(optionId: DecisionPlanOptionId): string {
  const approverId = SYNTHETIC_APPROVER_POLICY[optionId]
  if (!approverId) throw new DecisionPlanError('unknown_option', `Unknown decision-plan option: ${optionId}`)
  return approverId
}

// Injective encoding of the complete canonical idempotency key so different
// keys sharing the same suffix can never collide on one event ID.
const eventIdForKey = (idempotencyKey: string) => `decision-${encodeURIComponent(idempotencyKey)}`

const payloadOf = (command: DecisionPlanCommand) =>
  [command.optionId, command.rationale.trim(), command.actorId, command.workOrderIntentId] as const

export function createSafeResponsePlan(): SafeResponsePlan {
  return {
    options: [
        {
          id: 'expedite',
          label: 'Expedite the quoted BA-14TL assembly',
          tradeOff: 'Fastest path to deployment tomorrow, but commits budget and depends on one vendor quote',
          evidenceSummary: 'Desert Fleet Supply synthetic lookup: 1 assembly available, delivery tomorrow by 10:30 AM',
          confidence: 'Medium',
          quoteFreshness: 'Quoted during this investigation; verify before commitment',
          requiredApprover: 'Dana Foster · decision owner (synthetic policy)',
        },
        {
          id: 'reschedule',
          label: 'Reschedule the Northstar deployment',
          tradeOff: 'No spend or vendor dependency now, but the deployment slips and the asset stays out of service',
          evidenceSummary: 'Dispatch schedule shows the trailer is assigned to tomorrow’s mobilization',
          confidence: 'High',
          quoteFreshness: 'Schedule evidence observed 2026-08-21T14:20:00Z',
          requiredApprover: 'Dana Foster · decision owner (synthetic policy)',
        },
      ],
      reservationExecuted: false,
  }
}

export function recordDecisionPlan(state: SafeResponsePlan, command: DecisionPlanCommand): RecordedDecisionPlan {
  const priorEvents = state.events ?? []
  const existing = priorEvents.find(event => event.idempotencyKey === command.idempotencyKey)
  if (existing) {
    const priorPayload = [existing.optionId, existing.rationale, existing.actorId, existing.workOrderIntentId] as const
    const matches = priorPayload.every((value, index) => value === payloadOf(command)[index])
    if (!matches) {
      throw new DecisionPlanError('idempotency_conflict', 'Idempotency-key conflict: same key replayed with a different payload')
    }
    return { decisionPlan: state, events: priorEvents }
  }
  const option = state.options.find(candidate => candidate.id === command.optionId)
  if (!option) throw new DecisionPlanError('unknown_option', 'Unknown decision-plan option')
  // Authorization comes from the immutable trusted policy above — never from
  // caller-supplied option data. Tampering with plan options cannot authorize
  // a different actor.
  const authorizedApproverId = authorizedApproverIdFor(command.optionId)
  if (command.actorId !== authorizedApproverId) {
    throw new DecisionPlanError('authorization_denied', `Actor ${command.actorId} is not the authorized approver for option ${option.id}`)
  }
  if (!command.rationale.trim()) throw new DecisionPlanError('rationale_required', 'Decision rationale is required')
  const id = eventIdForKey(command.idempotencyKey)
  if (priorEvents.some(event => event.id === id)) {
    throw new DecisionPlanError('audit_integrity', `Duplicate decision event ID rejected: ${id}`)
  }
  const event: DecisionPlanEvent = {
    id,
    ...command,
    rationale: command.rationale.trim(),
    occurredAt: DEMO_CLOCK_ISO,
  }
  const events = [...priorEvents, event]
  const decisionPlan: SafeResponsePlanState = {
    ...state,
    selectedOptionId: command.optionId,
    reservationExecuted: false,
    boundaryStatement: command.optionId === 'expedite'
      ? 'Reservation/purchase not executed · no supplier was contacted'
      : 'Deployment reschedule recorded in the synthetic workspace only',
    events,
  }
  return { decisionPlan, events }
}
