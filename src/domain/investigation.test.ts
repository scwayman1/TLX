import { describe, expect, it } from 'vitest'
import {
  approveToolRun, createAssetRiskInvestigation, executeApprovedToolRun,
  rejectToolRun, proposeToolRun,
} from './investigation'

describe('co-piloted investigation', () => {
  it('starts with an operating question and grounded internal evidence', () => {
    const investigation = createAssetRiskInvestigation()
    expect(investigation.question).toBe('Why is TRL-443 becoming a risk, and what should we do?')
    expect(investigation.evidence.every(item => item.source && item.observedAt)).toBe(true)
    expect(investigation.timeline[0].kind).toBe('intent.recorded')
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
