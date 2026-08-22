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
        },
        {
          id: 'reschedule',
          label: 'Reschedule the Northstar deployment',
          tradeOff: 'No spend or vendor dependency now, but the deployment slips and the asset stays out of service',
          evidenceSummary: 'Dispatch schedule shows the trailer is assigned to tomorrow’s mobilization',
          confidence: 'High',
          quoteFreshness: 'Schedule evidence observed 2026-08-21T14:20:00Z',
          requiredApprover: 'Dana Foster · decision owner',
        },
      ],
      reservationExecuted: false,
  }
}

export function recordDecisionPlan(state: SafeResponsePlan, command: DecisionPlanCommand): RecordedDecisionPlan {
  const priorEvents = state.events ?? []
  const existing = priorEvents.find(event => event.idempotencyKey === command.idempotencyKey)
  if (existing) return { decisionPlan: state, events: priorEvents }
  if (!state.options.some(option => option.id === command.optionId)) throw new Error('Unknown decision-plan option')
  if (!command.rationale.trim()) throw new Error('Decision rationale is required')
  const event: DecisionPlanEvent = {
    id: `decision-${command.idempotencyKey}`,
    ...command,
    occurredAt: new Date().toISOString(),
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
