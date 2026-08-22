import { describe, expect, it } from 'vitest'
import { createSafeResponsePlan, recordDecisionPlan } from './decision-plan'

describe('safe-response decision plan', () => {
  it('presents exactly two options with trade-offs and records an audited expedite decision', () => {
    const plan = createSafeResponsePlan()
    expect(plan.options).toHaveLength(2)
    expect(plan.options.map(option => option.id)).toEqual(['expedite', 'reschedule'])
    expect(plan.options.every(option => option.tradeOff && option.evidenceSummary && option.confidence && option.quoteFreshness && option.requiredApprover)).toBe(true)

    const recorded = recordDecisionPlan(plan, {
      optionId: 'expedite',
      rationale: 'Deployment tomorrow depends on this trailer',
      actorId: 'user-dfoster',
      workOrderIntentId: 'WO-24091',
      idempotencyKey: 'decision:WO-24091:v1',
    })

    expect(recorded.events).toHaveLength(1)
    expect(recorded.events[0]).toMatchObject({
      optionId: 'expedite',
      actorId: 'user-dfoster',
      rationale: 'Deployment tomorrow depends on this trailer',
      workOrderIntentId: 'WO-24091',
    })
    expect(recorded.decisionPlan.selectedOptionId).toBe('expedite')
    expect(recorded.decisionPlan.reservationExecuted).toBe(false)
    expect(recorded.decisionPlan.boundaryStatement).toContain('Reservation/purchase not executed')
  })

  it('is idempotent when the same decision-plan command is replayed', () => {
    const plan = createSafeResponsePlan()
    const command = {
      optionId: 'reschedule' as const,
      rationale: 'Vendor quote cannot be verified in time',
      actorId: 'user-dfoster',
      workOrderIntentId: 'WO-24091',
      idempotencyKey: 'decision:WO-24091:v1',
    }
    const first = recordDecisionPlan(plan, command)
    const replay = recordDecisionPlan(first.decisionPlan, command)

    expect(replay.events).toHaveLength(1)
    expect(replay.events[0]).toMatchObject({ optionId: 'reschedule', actorId: 'user-dfoster' })
    expect(replay.decisionPlan.selectedOptionId).toBe('reschedule')
    expect(replay.decisionPlan.reservationExecuted).toBe(false)
  })

  it('fails closed when the same idempotency key replays a different payload', () => {
    const plan = createSafeResponsePlan()
    const command = {
      optionId: 'expedite' as const,
      rationale: 'Deployment tomorrow depends on this trailer',
      actorId: 'user-dfoster',
      workOrderIntentId: 'WO-24091',
      idempotencyKey: 'decision:WO-24091:v1',
    }
    const first = recordDecisionPlan(plan, command)

    const replayDifferentRationale = () =>
      recordDecisionPlan(first.decisionPlan, { ...command, rationale: 'Changed rationale' })
    expect(replayDifferentRationale).toThrow(/different payload/)

    const replayDifferentOption = () =>
      recordDecisionPlan(first.decisionPlan, {
        ...command,
        optionId: 'reschedule',
      })
    expect(replayDifferentOption).toThrow(/different payload/)

    const replayDifferentActor = () =>
      recordDecisionPlan(first.decisionPlan, { ...command, actorId: 'user-scott' })
    expect(replayDifferentActor).toThrow(/different payload/)
  })

  it('enforces that the recorded actor is the selected option’s authorized approver', () => {
    const plan = createSafeResponsePlan()
    expect(plan.options.every(option => option.requiredApproverId === 'user-dfoster')).toBe(true)
    expect(plan.options[0].requiredApprover).toContain('Dana Foster')

    const unauthorized = () =>
      recordDecisionPlan(plan, {
        optionId: 'expedite',
        rationale: 'Deployment tomorrow depends on this trailer',
        actorId: 'user-scott',
        workOrderIntentId: 'WO-24091',
        idempotencyKey: 'decision:WO-24091:v1',
      })
    expect(unauthorized).toThrow(/authorized approver/)
  })

  it('yields identical event IDs and timestamps for identical flows', () => {
    const command = {
      optionId: 'expedite' as const,
      rationale: 'Deployment tomorrow depends on this trailer',
      actorId: 'user-dfoster',
      workOrderIntentId: 'WO-24091',
      idempotencyKey: 'decision:WO-24091:v1',
    }
    const first = recordDecisionPlan(createSafeResponsePlan(), command)
    const second = recordDecisionPlan(createSafeResponsePlan(), command)

    expect(second.events).toEqual(first.events)
  })
})
