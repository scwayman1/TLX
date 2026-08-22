export type SafetyClass = 'read_only' | 'reversible_write' | 'consequential' | 'prohibited'

export type FleetException = {
  exceptionId: string
  tenantId: string
  siteId: string
  assetId: string
  kind: 'maintenance_due' | 'safety_alert' | 'telemetry_anomaly' | 'other'
  severity: 'info' | 'warning' | 'critical'
  status: 'open' | 'investigating' | 'action_proposed' | 'awaiting_approval' | 'resolved' | 'closed'
  observedAt: string
  source: { system: string; sourceId: string }
  summary: string
  version: number
}

export type EvidenceRecord = {
  evidenceId: string
  exceptionId: string
  sourceType: 'internal' | 'public_gemone' | 'user_provided'
  sourceUri: string
  sourceTitle: string
  publisherOrOwner: string
  retrievedAt: string
  observedAt: string | null
  freshness: 'fresh' | 'stale' | 'unknown'
  confidence: 'documented' | 'corroborated' | 'inferred' | 'unknown'
  contentHash: `sha256:${string}`
  excerpt: string
  classification: 'public' | 'internal' | 'restricted'
  authorizationBasis: string
  supersedes: string | null
}

export type ToolActivity = {
  activityId: string
  investigationId: string
  toolName: string
  safetyClass: SafetyClass
  state: 'requested' | 'authorized' | 'running' | 'succeeded' | 'failed' | 'timed_out' | 'cancelled'
  startedAt: string
  completedAt: string | null
  safeSummary: string
  evidenceIds: string[]
  correlationId: string
  errorCode: string | null
}

export type TimelineEvent = {
  eventId: string
  investigationId: string
  sequence: number
  eventType: 'exception_opened' | 'evidence_added' | 'tool_activity' | 'plan_proposed' | 'approval_recorded' | 'action_state_changed' | 'investigation_closed'
  actorType: 'user' | 'agent' | 'system' | 'integration'
  actorId: string
  occurredAt: string
  correlationId: string
  subjectRef: string
  safeSummary: string
  payloadHash: `sha256:${string}`
  previousEventHash: `sha256:${string}` | null
}

export type ProposedAction = {
  actionId: string
  adapter: string
  operation: string
  targetRef: string
  safetyClass: SafetyClass
  impactPreview: string
  idempotencyKey: string
  preconditions: string[]
  expectedResult: string
  recoveryPlan: string
}

export type ProposedPlan = {
  planId: string
  investigationId: string
  version: number
  summary: string
  evidenceIds: string[]
  assumptions: string[]
  unknowns: string[]
  actions: ProposedAction[]
}

export type ApprovalDecision = {
  decisionId: string
  planId: string
  planVersion: number
  actorId: string
  decision: 'approved'
  approvedActionIds: string[]
  reason: string
  policySnapshot: string
}

export type ExecutionState =
  | 'accepted'
  | 'dispatched'
  | 'acknowledged'
  | 'applied'
  | 'failed'
  | 'timed_out'
  | 'reconciling'
  | 'cancelled'

export type ActionExecution = {
  executionId: string
  actionId: string
  decisionId: string
  idempotencyKey: string
  state: ExecutionState
  attempt: number
}

export function createPlan(plan: ProposedPlan): ProposedPlan {
  return plan
}

export function approvePlan(
  plan: ProposedPlan,
  input: Omit<ApprovalDecision, 'planId' | 'planVersion' | 'decision'>,
): ApprovalDecision {
  const planActionIds = new Set(plan.actions.map((action) => action.actionId))
  if (input.approvedActionIds.some((actionId) => !planActionIds.has(actionId))) {
    throw new Error('Approval references an action outside the plan')
  }

  return {
    ...input,
    planId: plan.planId,
    planVersion: plan.version,
    decision: 'approved',
  }
}

export function executeApprovedAction(
  plan: ProposedPlan,
  decision: ApprovalDecision,
  actionId: string,
  existingExecutions: ActionExecution[] = [],
): ActionExecution {
  if (decision.planId !== plan.planId || decision.planVersion !== plan.version) {
    throw new Error('Approval does not match plan version')
  }

  if (!decision.approvedActionIds.includes(actionId)) {
    throw new Error('Action was not explicitly approved')
  }

  const action = plan.actions.find((candidate) => candidate.actionId === actionId)
  if (!action) throw new Error('Action not found')
  if (action.safetyClass === 'prohibited') throw new Error('Prohibited actions cannot be executed')

  const existing = existingExecutions.find(
    (execution) => execution.idempotencyKey === action.idempotencyKey,
  )
  if (existing) return existing

  return {
    executionId: `exec:${decision.decisionId}:${actionId}`,
    actionId,
    decisionId: decision.decisionId,
    idempotencyKey: action.idempotencyKey,
    state: 'accepted',
    attempt: 1,
  }
}

const executionTransitions: Record<ExecutionState, ExecutionState[]> = {
  accepted: ['dispatched'],
  dispatched: ['acknowledged', 'timed_out'],
  acknowledged: ['applied'],
  applied: [],
  failed: [],
  timed_out: ['reconciling'],
  reconciling: [],
  cancelled: [],
}

export function transitionExecution(
  execution: ActionExecution,
  nextState: ExecutionState,
): ActionExecution {
  if (!executionTransitions[execution.state].includes(nextState)) {
    throw new Error(`Invalid execution transition: ${execution.state} -> ${nextState}`)
  }
  return { ...execution, state: nextState }
}
