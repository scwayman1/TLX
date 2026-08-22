import { DEMO_CLOCK_ISO } from './investigation'

export type DecisionPlanOptionId = 'expedite' | 'reschedule'
export type DecisionPlanOption = {
  id: DecisionPlanOptionId
  label: string
  tradeOff: string
  evidenceSummary: string
  confidence: 'High' | 'Medium' | 'Low'
  quoteFreshness: string
  requiredApprover: string
  requiredApproverId: string
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
          requiredApprover: 'Dana Foster · decision owner',
          requiredApproverId: 'user-dfoster',
        },
        {
          id: 'reschedule',
          label: 'Reschedule the Northstar deployment',
          tradeOff: 'No spend or vendor dependency now, but the deployment slips and the asset stays out of service',
          evidenceSummary: 'Dispatch schedule shows the trailer is assigned to tomorrow’s mobilization',
          confidence: 'High',
          quoteFreshness: 'Schedule evidence observed 2026-08-21T14:20:00Z',
          requiredApprover: 'Dana Foster · decision owner',
          requiredApproverId: 'user-dfoster',
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
    if (!matches) throw new Error('Idempotency-key conflict: same key replayed with a different payload')
    return { decisionPlan: state, events: priorEvents }
  }
  const option = state.options.find(candidate => candidate.id === command.optionId)
  if (!option) throw new Error('Unknown decision-plan option')
  if (command.actorId !== option.requiredApproverId) {
    throw new Error(`Actor ${command.actorId} is not the authorized approver for option ${option.id}`)
  }
  if (!command.rationale.trim()) throw new Error('Decision rationale is required')
  const event: DecisionPlanEvent = {
    id: `decision-${command.workOrderIntentId}-${command.idempotencyKey.split(':').pop()}`,
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
