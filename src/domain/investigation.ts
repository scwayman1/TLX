export type Evidence = {
  id: string
  label: string
  value: string
  source: string
  observedAt: string
  type: 'Fact' | 'History' | 'Constraint'
}
export type ToolRunStatus = 'Proposed' | 'Approved' | 'Rejected' | 'Completed'
export type ToolRun = {
  id: string
  tool: string
  purpose: string
  inputSummary: string
  status: ToolRunStatus
  approvedBy?: string
  rejectionReason?: string
  output?: string
}
export type TimelineEvent = {
  id: string
  kind: 'intent.recorded' | 'grounding.completed' | 'interpretation.prepared' | 'tool.proposed' | 'tool.approved' | 'tool.rejected' | 'tool.completed' | 'decision.recorded'
  label: string
  actorId: string
  occurredAt: string
}
export type Investigation = {
  id: string
  assetId: string
  question: string
  status: 'Interpreting' | 'Waiting approval' | 'Enriching' | 'Ready for decision'
  evidence: Evidence[]
  facts: string[]
  inferences: { statement: string; confidence: 'High' | 'Medium' | 'Low'; rationale: string }[]
  recommendation: string
  pendingToolRun?: ToolRun
  timeline: TimelineEvent[]
}
export type ToolProposal = Pick<ToolRun, 'tool' | 'purpose' | 'inputSummary'>

// Bounded synthetic-demo clock and ID source: identical flows after reset must
// produce identical audit records (timestamps and event IDs). Not general
// infrastructure — replace with injected clock/IDs only if real persistence lands.
export const DEMO_CLOCK_ISO = '2026-08-21T15:00:00.000Z'

let deterministicCounter = 0

const now = () => DEMO_CLOCK_ISO
const event = (kind: TimelineEvent['kind'], label: string, actorId: string): TimelineEvent => {
  deterministicCounter += 1
  const sequence = String(deterministicCounter).padStart(4, '0')
  return { id: `${kind}-${sequence}`, kind, label, actorId, occurredAt: now() }
}

export function resetDeterministicIds(): void {
  deterministicCounter = 0
}

export function appendDecisionToInvestigation(state: Investigation, decisionPlan: SafeResponsePlanStateLike): Investigation {
  const last = decisionPlan.events?.at(-1)
  if (!last) throw new Error('No recorded decision to append to the operating memory timeline')
  return {
    ...state,
    timeline: [...state.timeline, {
      id: `decision.recorded-${last.id}`,
      kind: 'decision.recorded',
      label: `Decision recorded: ${last.optionId} · ${last.workOrderIntentId} · ${last.rationale} · event ${last.id}`,
      actorId: last.actorId,
      occurredAt: last.occurredAt,
    }],
  }
}
type SafeResponsePlanStateLike = { events?: { id: string; optionId: string; rationale: string; actorId: string; workOrderIntentId: string; occurredAt: string }[] }

export function createAssetRiskInvestigation(): Investigation {
  return {
    id: 'INV-TRL-443-01', assetId: 'TRL-443',
    question: 'Why is TRL-443 becoming a risk, and what should we do?', status: 'Interpreting',
    evidence: [
      { id:'ev-inspection',label:'Brake inspection',value:'Left brake assembly failed safety threshold',source:'Inspection INSP-8841',observedAt:'2026-08-21T14:18:00Z',type:'Fact' },
      { id:'ev-history',label:'Repeat defect',value:'Three brake-related findings in 180 days',source:'Asset service history',observedAt:'2026-08-21T14:19:00Z',type:'History' },
      { id:'ev-utilization',label:'Operational demand',value:'Assigned to Northstar mobilization tomorrow',source:'Dispatch schedule',observedAt:'2026-08-21T14:20:00Z',type:'Constraint' },
      { id:'ev-stock',label:'Internal inventory',value:'No BA-14TL assemblies on hand',source:'Phoenix parts ledger',observedAt:'2026-08-21T14:21:00Z',type:'Fact' },
    ],
    facts:['Asset is currently out of service','A required brake assembly is unavailable internally','Tomorrow’s deployment depends on this trailer'],
    inferences:[{statement:'The immediate risk is schedule failure caused by parts availability, not diagnostic uncertainty.',confidence:'High',rationale:'The failed component is identified and internal stock is zero.'},{statement:'Repeat brake findings may indicate a broader maintenance-pattern issue.',confidence:'Medium',rationale:'Three related findings exist, but prior root-cause detail is incomplete.'}],
    recommendation:'Verify preferred-vendor availability, then present expedite-versus-reschedule options for human approval.',
    timeline:[event('intent.recorded','Operating question recorded','user-scott'),event('grounding.completed','Four internal evidence sources retrieved','agent-operations'),event('interpretation.prepared','Risk interpretation prepared for review','agent-operations')],
  }
}

export function proposeToolRun(state: Investigation, proposal: ToolProposal): Investigation {
  return { ...state, status:'Waiting approval', pendingToolRun:{id:`TOOL-${Date.now()}`,...proposal,status:'Proposed'}, timeline:[...state.timeline,event('tool.proposed',`${proposal.tool} proposed: ${proposal.purpose}`,'agent-operations')] }
}
export function approveToolRun(state: Investigation, actorId: string): Investigation {
  if (!state.pendingToolRun || state.pendingToolRun.status !== 'Proposed') throw new Error('No proposed tool run')
  return { ...state,status:'Enriching',pendingToolRun:{...state.pendingToolRun,status:'Approved',approvedBy:actorId},timeline:[...state.timeline,event('tool.approved',`${state.pendingToolRun.tool} approved`,actorId)] }
}
export function rejectToolRun(state: Investigation, actorId: string, reason: string): Investigation {
  if (!state.pendingToolRun || state.pendingToolRun.status !== 'Proposed') throw new Error('No proposed tool run')
  return { ...state,status:'Ready for decision',pendingToolRun:{...state.pendingToolRun,status:'Rejected',approvedBy:actorId,rejectionReason:reason},timeline:[...state.timeline,event('tool.rejected',`${state.pendingToolRun.tool} rejected: ${reason}`,actorId)] }
}
export function executeApprovedToolRun(state: Investigation, output: string): Investigation {
  if (!state.pendingToolRun || state.pendingToolRun.status !== 'Approved') throw new Error('Human approval required')
  return { ...state,status:'Ready for decision',pendingToolRun:{...state.pendingToolRun,status:'Completed',output},timeline:[...state.timeline,event('tool.completed',`${state.pendingToolRun.tool} completed with visible synthetic output`,'tool-simulator')] }
}
