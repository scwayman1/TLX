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

  it('produces identical complete timelines for identical flows with no wall-clock or random identity', () => {
    const build = () => {
      let state = createAssetRiskInvestigation()
      state = proposeToolRun(state, { tool: 'Preferred vendor availability', purpose: 'Verify brake assembly availability', inputSummary: 'BA-14TL brake assembly' })
      state = approveToolRun(state, 'user-scott')
      state = executeApprovedToolRun(state, 'Synthetic output')
      return state
    }
    const first = build()
    build() // interleaved build must not perturb identity
    const second = build()
    expect(second.timeline.map(event => event.id)).toEqual(first.timeline.map(event => event.id))
    expect(second.timeline.map(event => event.occurredAt)).toEqual(first.timeline.map(event => event.occurredAt))
    expect(new Set(first.timeline.map(event => event.id)).size).toBe(first.timeline.length)
    expect(first.timeline.every(event => event.occurredAt === '2026-08-21T15:00:00.000Z')).toBe(true)
  })

  it('gives distinct proposals of the same tool distinct deterministic IDs', () => {
    const first = proposeToolRun(createAssetRiskInvestigation(), {
      tool: 'Vendor availability lookup', purpose: 'Check stock', inputSummary: 'BA-14TL',
    })
    const second = proposeToolRun(first, {
      tool: 'Vendor availability lookup', purpose: 'Check refurbished stock instead', inputSummary: 'BA-14TL refurbished',
    })
    expect(first.pendingToolRun?.id).toBeTruthy()
    expect(second.pendingToolRun?.id).not.toBe(first.pendingToolRun?.id)

    const replayedFirst = proposeToolRun(createAssetRiskInvestigation(), {
      tool: 'Vendor availability lookup', purpose: 'Check stock', inputSummary: 'BA-14TL',
    })
    expect(replayedFirst.pendingToolRun?.id).toBe(first.pendingToolRun?.id)
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
