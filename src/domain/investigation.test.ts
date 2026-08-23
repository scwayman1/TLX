import { describe, expect, it } from 'vitest'
import {
  approveToolRun, createAssetRiskInvestigation, executeApprovedToolRun,
  proposeToolRun, rejectToolRun,
  SYNTHETIC_ACTIVE_ACTOR_ID, SYNTHETIC_ACTIVE_ACTOR_LABEL,
} from './investigation'

describe('co-piloted investigation', () => {
  it('starts with an operating question and grounded internal evidence', () => {
    const investigation = createAssetRiskInvestigation()
    expect(investigation.question).toBe('Why is TRL-443 becoming a risk, and what should we do?')
    expect(investigation.evidence.every(item => item.source && item.observedAt)).toBe(true)
    expect(investigation.timeline[0].kind).toBe('intent.recorded')
  })

  it('uses one explicit synthetic active actor across the flow, visibly labeled synthetic', () => {
    expect(SYNTHETIC_ACTIVE_ACTOR_ID).toBe('user-scott')
    expect(SYNTHETIC_ACTIVE_ACTOR_LABEL).toMatch(/synthetic/i)
    const investigation = createAssetRiskInvestigation()
    const proposed = proposeToolRun(investigation, { tool: 'Vendor availability lookup', purpose: 'Check stock', inputSummary: 'BA-14TL' })
    const approved = approveToolRun(proposed, SYNTHETIC_ACTIVE_ACTOR_ID)
    expect(approved.pendingToolRun?.approvedBy).toBe(SYNTHETIC_ACTIVE_ACTOR_ID)
    expect(approved.timeline.at(-1)?.actorId).toBe(SYNTHETIC_ACTIVE_ACTOR_ID)
  })

  it('produces identical complete timelines without any shared mutable counter', () => {
    const build = () => {
      let state = createAssetRiskInvestigation()
      state = proposeToolRun(state, { tool: 'Preferred vendor availability', purpose: 'Verify brake assembly availability', inputSummary: 'BA-14TL brake assembly' })
      state = approveToolRun(state, SYNTHETIC_ACTIVE_ACTOR_ID)
      state = executeApprovedToolRun(state, 'Synthetic output')
      return state
    }
    // Multiple instances and interleaved builds must not affect IDs.
    const a = build()
    build()
    const c = build()
    expect(a.timeline.map(event => event.id)).toEqual(c.timeline.map(event => event.id))
    expect(a.timeline.map(event => event.occurredAt)).toEqual(c.timeline.map(event => event.occurredAt))
    expect(new Set(a.timeline.map(event => event.id)).size).toBe(a.timeline.length)
    expect(a.timeline.every(event => !event.occurredAt.includes(String(Date.now())))).toBe(true)
  })

  it('derives tool-run IDs deterministically from investigation state', () => {
    const proposal = { tool: 'Preferred vendor availability', purpose: 'Verify availability', inputSummary: 'BA-14TL' }
    const first = proposeToolRun(createAssetRiskInvestigation(), proposal)
    proposeToolRun(createAssetRiskInvestigation(), proposal)
    const third = proposeToolRun(createAssetRiskInvestigation(), proposal)
    expect(first.pendingToolRun?.id).toBe(third.pendingToolRun?.id)
    expect(first.pendingToolRun?.id).not.toMatch(/NaN/)
  })

  it('proposes external enrichment without executing it', () => {
    const investigation = proposeToolRun(createAssetRiskInvestigation(), {
      tool: 'Vendor availability lookup',
      purpose: 'Verify expedited brake assembly availability and delivery date',
      inputSummary: 'Brake assembly BA-14TL; Phoenix delivery',
    })
    expect(investigation.pendingToolRun?.status).toBe('Proposed')
    expect(investigation.pendingToolRun?.output).toBeUndefined()
    expect(investigation.timeline.at(-1)?.kind).toBe('tool.proposed')
  })

  it('prevents tool execution before human approval', () => {
    const investigation = proposeToolRun(createAssetRiskInvestigation(), {
      tool: 'Vendor availability lookup', purpose: 'Check stock', inputSummary: 'BA-14TL',
    })
    expect(() => executeApprovedToolRun(investigation, 'Synthetic vendor: in stock')).toThrow('Human approval required')
  })

  it('records approval and visible synthetic tool output', () => {
    const proposed = proposeToolRun(createAssetRiskInvestigation(), {
      tool: 'Vendor availability lookup', purpose: 'Check stock', inputSummary: 'BA-14TL',
    })
    const approved = approveToolRun(proposed, 'user-scott')
    const completed = executeApprovedToolRun(approved, 'Desert Fleet Supply: 1 assembly available; delivery tomorrow by 10:30 AM')
    expect(completed.pendingToolRun?.status).toBe('Completed')
    expect(completed.pendingToolRun?.approvedBy).toBe('user-scott')
    expect(completed.timeline.map(event => event.kind)).toContain('tool.completed')
  })

  it('records rejection and never executes the tool', () => {
    const proposed = proposeToolRun(createAssetRiskInvestigation(), {
      tool: 'Vendor availability lookup', purpose: 'Check stock', inputSummary: 'BA-14TL',
    })
    const rejected = rejectToolRun(proposed, 'user-scott', 'Use preferred vendor only')
    expect(rejected.pendingToolRun?.status).toBe('Rejected')
    expect(rejected.timeline.at(-1)).toMatchObject({ kind: 'tool.rejected', actorId: 'user-scott' })
    expect(() => executeApprovedToolRun(rejected, 'should not run')).toThrow('Human approval required')
  })
})
