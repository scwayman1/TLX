import { describe, expect, it } from 'vitest'
import { createSafeResponsePlan, recordDecisionPlan, DecisionPlanError, authorizedApproverIdFor } from './decision-plan'
import { SYNTHETIC_ACTIVE_ACTOR_ID } from './investigation'

describe('safe-response decision plan', () => {
  it('presents exactly two options with trade-offs and records an audited expedite decision', () => {
    const plan = createSafeResponsePlan()
    expect(plan.options).toHaveLength(2)
    expect(plan.options.map(option => option.id)).toEqual(['expedite', 'reschedule'])
    expect(plan.options.every(option => option.tradeOff && option.evidenceSummary && option.confidence && option.quoteFreshness && option.requiredApprover)).toBe(true)

    const recorded = recordDecisionPlan(plan, {
      optionId: 'expedite',
      rationale: 'Deployment tomorrow depends on this trailer',
      actorId: SYNTHETIC_ACTIVE_ACTOR_ID,
      workOrderIntentId: 'WO-24091',
      idempotencyKey: 'decision:WO-24091:v1',
    })

    expect(recorded.events).toHaveLength(1)
    expect(recorded.events[0]).toMatchObject({
      optionId: 'expedite',
      actorId: SYNTHETIC_ACTIVE_ACTOR_ID,
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
      actorId: SYNTHETIC_ACTIVE_ACTOR_ID,
      workOrderIntentId: 'WO-24091',
      idempotencyKey: 'decision:WO-24091:v1',
    }
    const first = recordDecisionPlan(plan, command)
    const replay = recordDecisionPlan(first.decisionPlan, command)

    expect(replay.events).toHaveLength(1)
    expect(replay.events[0]).toMatchObject({ optionId: 'reschedule', actorId: SYNTHETIC_ACTIVE_ACTOR_ID })
    expect(replay.decisionPlan.selectedOptionId).toBe('reschedule')
    expect(replay.decisionPlan.reservationExecuted).toBe(false)
  })

  it('fails closed when the same idempotency key replays a different payload', () => {
    const plan = createSafeResponsePlan()
    const command = {
      optionId: 'expedite' as const,
      rationale: 'Deployment tomorrow depends on this trailer',
      actorId: SYNTHETIC_ACTIVE_ACTOR_ID,
      workOrderIntentId: 'WO-24091',
      idempotencyKey: 'decision:WO-24091:v1',
    }
    const first = recordDecisionPlan(plan, command)

    const replayDifferentRationale = () =>
      recordDecisionPlan(first.decisionPlan, { ...command, rationale: 'Changed rationale' })
    expect(replayDifferentRationale).toThrow(/different payload/)
    try {
      recordDecisionPlan(first.decisionPlan, { ...command, rationale: 'Changed rationale' })
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(DecisionPlanError)
      expect((error as DecisionPlanError).code).toBe('idempotency_conflict')
    }

    const replayDifferentOption = () =>
      recordDecisionPlan(first.decisionPlan, {
        ...command,
        optionId: 'reschedule',
      })
    expect(replayDifferentOption).toThrow(/different payload/)

    const replayDifferentActor = () =>
      recordDecisionPlan(first.decisionPlan, { ...command, actorId: 'user-dfoster' })
    expect(replayDifferentActor).toThrow(/different payload/)
  })

  it('enforces authorization from an immutable trusted policy, not mutable plan state', () => {
    const plan = createSafeResponsePlan()
    // Options carry display text only; the approver policy lives outside the payload.
    expect('requiredApproverId' in plan.options[0]).toBe(false)
    expect(authorizedApproverIdFor('expedite')).toBe(SYNTHETIC_ACTIVE_ACTOR_ID)
    expect(authorizedApproverIdFor('reschedule')).toBe(SYNTHETIC_ACTIVE_ACTOR_ID)

    // Tampering with any caller-supplied option state cannot authorize a different actor.
    const tampered = createSafeResponsePlan()
    ;(tampered.options[0] as Record<string, unknown>).requiredApproverId = 'user-dfoster'
    ;(tampered.options[1] as Record<string, unknown>).requiredApprover = 'Scott Wayman · decision owner'

    const unauthorized = () =>
      recordDecisionPlan(tampered, {
        optionId: 'expedite',
        rationale: 'Deployment tomorrow depends on this trailer',
        actorId: 'user-dfoster',
        workOrderIntentId: 'WO-24091',
        idempotencyKey: 'decision:WO-24091:tamper-probe',
      })
    try {
      unauthorized()
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(DecisionPlanError)
      expect((error as DecisionPlanError).code).toBe('authorization_denied')
    }

    // The legitimate synthetic approver is unaffected by the tampering.
    expect(() =>
      recordDecisionPlan(tampered, {
        optionId: 'expedite',
        rationale: 'Deployment tomorrow depends on this trailer',
        actorId: SYNTHETIC_ACTIVE_ACTOR_ID,
        workOrderIntentId: 'WO-24091',
        idempotencyKey: 'decision:WO-24091:tamper-probe',
      }),
    ).not.toThrow()
  })

  it('produces distinct typed error codes for validation, authorization, idempotency, and integrity failures', () => {
    const plan = createSafeResponsePlan()
    const base = {
      optionId: 'expedite' as const,
      rationale: 'Deployment tomorrow depends on this trailer',
      actorId: SYNTHETIC_ACTIVE_ACTOR_ID,
      workOrderIntentId: 'WO-24091',
      idempotencyKey: 'decision:WO-24091:error-codes',
    }

    const codeOf = (fn: () => unknown): string => {
      try {
        fn()
      } catch (error) {
        expect(error).toBeInstanceOf(DecisionPlanError)
        return (error as DecisionPlanError).code
      }
      throw new Error('expected the command to fail')
    }

    expect(codeOf(() => recordDecisionPlan(plan, { ...base, optionId: 'nope' as never }))).toBe('unknown_option')
    expect(codeOf(() => recordDecisionPlan(plan, { ...base, rationale: '   ' }))).toBe('rationale_required')
    expect(codeOf(() => recordDecisionPlan(plan, { ...base, actorId: 'user-dfoster' }))).toBe('authorization_denied')

    const recorded = recordDecisionPlan(plan, base)
    expect(codeOf(() => recordDecisionPlan(recorded.decisionPlan, { ...base, rationale: 'changed' }))).toBe('idempotency_conflict')
  })

  it('derives injective event IDs from the complete canonical idempotency key', () => {
    const plan = createSafeResponsePlan()
    const commandFor = (idempotencyKey: string) => ({
      optionId: 'expedite' as const,
      rationale: 'Deployment tomorrow depends on this trailer',
      actorId: SYNTHETIC_ACTIVE_ACTOR_ID,
      workOrderIntentId: 'WO-24091',
      idempotencyKey,
    })

    const sharedSuffixA = recordDecisionPlan(plan, commandFor('decision:WO-24091:a'))
    const sharedSuffixB = recordDecisionPlan(plan, commandFor('decision:WO-24091:b'))
    const suffixOnly = recordDecisionPlan(plan, commandFor('v1'))

    const ids = [sharedSuffixA, sharedSuffixB, suffixOnly].map(result => result.events[0].id)
    expect(new Set(ids).size).toBe(3)
    expect(ids[0]).not.toBe(ids[1])
  })

  it('keeps multiple valid decision events and rejects duplicate event IDs independently', () => {
    const plan = createSafeResponsePlan()
    const commandFor = (idempotencyKey: string, optionId: 'expedite' | 'reschedule') => ({
      optionId,
      rationale: `Rationale for ${optionId}`,
      actorId: SYNTHETIC_ACTIVE_ACTOR_ID,
      workOrderIntentId: 'WO-24091',
      idempotencyKey,
    })

    const first = recordDecisionPlan(plan, commandFor('decision:WO-24091:one', 'expedite'))
    const second = recordDecisionPlan(first.decisionPlan, commandFor('decision:WO-24091:two', 'reschedule'))
    expect(second.events).toHaveLength(2)
    expect(new Set(second.events.map(event => event.id)).size).toBe(2)

    // Independent duplicate-event-id rejection: a hand-crafted state carrying an
    // event whose id collides with the newly derived one fails closed.
    const forgedEvent = { ...second.events[1], id: `decision-${encodeURIComponent('decision:WO-24091:three')}` }
    const forgedState = { ...second.decisionPlan, events: [second.events[0], forgedEvent] }
    const duplicateId = () => recordDecisionPlan(forgedState, commandFor('decision:WO-24091:three', 'expedite'))
    try {
      duplicateId()
      expect.unreachable()
    } catch (error) {
      expect(error).toBeInstanceOf(DecisionPlanError)
      expect((error as DecisionPlanError).code).toBe('audit_integrity')
    }
  })

  it('yields identical event IDs and timestamps for identical flows', () => {
    const command = {
      optionId: 'expedite' as const,
      rationale: 'Deployment tomorrow depends on this trailer',
      actorId: SYNTHETIC_ACTIVE_ACTOR_ID,
      workOrderIntentId: 'WO-24091',
      idempotencyKey: 'decision:WO-24091:v1',
    }
    const first = recordDecisionPlan(createSafeResponsePlan(), command)
    const second = recordDecisionPlan(createSafeResponsePlan(), command)

    expect(second.events).toEqual(first.events)
  })
})
