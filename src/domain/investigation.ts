import { DEMO_CLOCK_ISO, SYNTHETIC_PERSONA } from './demo-fixture'

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
  kind: 'intent.recorded' | 'grounding.completed' | 'interpretation.prepared' | 'tool.proposed' | 'tool.approved' | 'tool.rejected' | 'tool.completed'
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

// All identity in this flow derives from the fixed demo clock and the
// investigation's own typed state — never from wall clock, randomness, or
// module-global counters — so identical flows yield identical audit records.
const now = () => DEMO_CLOCK_ISO

const nextTimelineEventId = (timeline: TimelineEvent[], kind: TimelineEvent['kind']): string => {
  const existingIds = new Set(timeline.map(item => item.id))
  let sequence = timeline.filter(item => item.kind === kind).length + 1
  let candidate = `${kind}-${String(sequence).padStart(4, '0')}`
  while (existingIds.has(candidate)) {
    sequence += 1
    candidate = `${kind}-${String(sequence).padStart(4, '0')}`
  }
  return candidate
}

const appendEvent = (timeline: TimelineEvent[], kind: TimelineEvent['kind'], label: string, actorId: string): TimelineEvent[] =>
  [...timeline, { id: nextTimelineEventId(timeline, kind), kind, label, actorId, occurredAt: now() }]

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
    timeline: appendEvent(appendEvent(appendEvent([],
      'intent.recorded', 'Operating question recorded', SYNTHETIC_PERSONA.actorId),
      'grounding.completed', 'Four internal evidence sources retrieved', 'agent-operations'),
      'interpretation.prepared', 'Risk interpretation prepared for review', 'agent-operations'),
  }
}

export function proposeToolRun(state: Investigation, proposal: ToolProposal): Investigation {
  const proposalSequence = state.timeline.filter(item => item.kind === 'tool.proposed').length + 1
  return { ...state, status:'Waiting approval', pendingToolRun:{id:`TOOL-${state.id}-${String(proposalSequence).padStart(4, '0')}`,...proposal,status:'Proposed'}, timeline:appendEvent(state.timeline,'tool.proposed',`${proposal.tool} proposed: ${proposal.purpose}`,'agent-operations') }
}
export function approveToolRun(state: Investigation, actorId: string): Investigation {
  if (!state.pendingToolRun || state.pendingToolRun.status !== 'Proposed') throw new Error('No proposed tool run')
  return { ...state,status:'Enriching',pendingToolRun:{...state.pendingToolRun,status:'Approved',approvedBy:actorId},timeline:appendEvent(state.timeline,'tool.approved',`${state.pendingToolRun.tool} approved`,actorId) }
}
export function rejectToolRun(state: Investigation, actorId: string, reason: string): Investigation {
  if (!state.pendingToolRun || state.pendingToolRun.status !== 'Proposed') throw new Error('No proposed tool run')
  return { ...state,status:'Ready for decision',pendingToolRun:{...state.pendingToolRun,status:'Rejected',approvedBy:actorId,rejectionReason:reason},timeline:appendEvent(state.timeline,'tool.rejected',`${state.pendingToolRun.tool} rejected: ${reason}`,actorId) }
}
export function executeApprovedToolRun(state: Investigation, output: string): Investigation {
  if (!state.pendingToolRun || state.pendingToolRun.status !== 'Approved') throw new Error('Human approval required')
  return { ...state,status:'Ready for decision',pendingToolRun:{...state.pendingToolRun,status:'Completed',output},timeline:appendEvent(state.timeline,'tool.completed',`${state.pendingToolRun.tool} completed with visible synthetic output`,'tool-simulator') }
}
