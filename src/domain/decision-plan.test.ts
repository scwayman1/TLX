import { describe, expect, it } from 'vitest'
import { createSafeResponsePlan, recordDecisionPlan, integrateDecisionEvents, DecisionPlanError } from './decision-plan'
import { DEMO_CLOCK_ISO, SYNTHETIC_PERSONA } from './demo-fixture'
import { createAssetRiskInvestigation } from './investigation'

const baseCommand = {
  optionId: 'expedite' as const,
  rationale: 'Deployment tomorrow depends on this trailer',
  actorId: SYNTHETIC_PERSONA.actorId,
  workOrderIntentId: 'WO-24091',
  idempotencyKey: 'decision:WO-24091:expedite-v1',
}

describe('safe-response decision plan', () => {
  it('presents exactly two options and records an audited expedite decision with the visible boundary', () => {
    const plan = createSafeResponsePlan()
    expect(plan.options.map(option => option.id)).toEqual(['expedite', 'reschedule'])
    expect(plan.options.every(option => option.tradeOff && option.evidenceSummary && option.confidence && option.quoteFreshness)).toBe(true)
    expect(plan.events).toEqual([])
    expect(plan.reservationExecuted).toBe(false)

    const recorded = recordDecisionPlan(plan, baseCommand)
    expect(recorded.events).toHaveLength(1)
    expect(recorded.events[0]).toMatchObject({
      optionId: 'expedite',
      actorId: SYNTHETIC_PERSONA.actorId,
      rationale: 'Deployment tomorrow depends on this trailer',
      workOrderIntentId: 'WO-24091',
      occurredAt: DEMO_CLOCK_ISO,
    })
    expect(recorded.decisionPlan.selectedOptionId).toBe('expedite')
    expect(recorded.decisionPlan.reservationExecuted).toBe(false)
    expect(recorded.decisionPlan.boundaryStatement).toContain('Reservation/purchase not executed')
  })

  it('rejects every non-canonical idempotency key with the typed invalid_idempotency_key error', () => {
    const plan = createSafeResponsePlan()
    const codeFor = (idempotencyKey: string): string => {
      try {
        recordDecisionPlan(plan, { ...baseCommand, idempotencyKey })
      } catch (error) {
        expect(error, `key ${JSON.stringify(idempotencyKey)} must throw the typed domain error`).toBeInstanceOf(DecisionPlanError)
        return (error as DecisionPlanError).code
      }
      throw new Error(`key ${JSON.stringify(idempotencyKey)} was accepted`)
    }

    const malformedKeys = [
      '',                                     // empty
      '   ',                                  // whitespace only
      'decision:WO-24091:',                   // empty label
      'decision:WO-24091:Expedite V1',        // uppercase + space
      'decision:WO-24091:expedite:v1',        // extra delimiter inside label
      'order:WO-24091:expedite-v1',           // wrong prefix
      'decision:XX-24091:expedite-v1',        // malformed work-order segment
      'decision:WO-11111:expedite-v1',        // delimiter-consistent but wrong work order for the command
      'decision:WO-24091:expedite-v1\uD800',  // lone UTF-16 surrogate
      '\uDC00decision:WO-24091:expedite-v1',  // leading lone surrogate
    ]
    for (const key of malformedKeys) {
      expect(codeFor(key)).toBe('invalid_idempotency_key')
    }
  })

  it('authorizes only the frozen synthetic policy approver and validates options canonically', () => {
    const codeOf = (fn: () => unknown): string => {
      try {
        fn()
      } catch (error) {
        expect(error).toBeInstanceOf(DecisionPlanError)
        return (error as DecisionPlanError).code
      }
      throw new Error('expected the command to fail')
    }

    // Unknown option fails closed before any recording.
    expect(codeOf(() => recordDecisionPlan(createSafeResponsePlan(), { ...baseCommand, optionId: 'nope' as never }))).toBe('unknown_option')

    // A canonical option removed from the plan's option state cannot be decided.
    const emptied = { ...createSafeResponsePlan(), options: [] }
    expect(codeOf(() => recordDecisionPlan(emptied, baseCommand))).toBe('unknown_option')

    // Unauthorized actors are denied by the frozen policy.
    expect(codeOf(() => recordDecisionPlan(createSafeResponsePlan(), { ...baseCommand, actorId: 'user-dfoster' }))).toBe('authorization_denied')

    // Tampering with caller-mutable option state cannot authorize a different actor.
    const tampered = createSafeResponsePlan()
    ;(tampered.options[0] as Record<string, unknown>).requiredApproverId = 'user-dfoster'
    ;(tampered.options[0] as Record<string, unknown>).requiredApprover = 'Dana Foster · decision owner'
    expect(codeOf(() => recordDecisionPlan(tampered, { ...baseCommand, actorId: 'user-dfoster' }))).toBe('authorization_denied')
    expect(() => recordDecisionPlan(tampered, baseCommand)).not.toThrow()
  })

  it('treats an exact replay as a no-op and fails closed on any payload drift under the same key', () => {
    const first = recordDecisionPlan(createSafeResponsePlan(), baseCommand)
    const replay = recordDecisionPlan(first.decisionPlan, baseCommand)
    expect(replay.events).toHaveLength(1)
    expect(replay.events).toEqual(first.events)
    // Rationale that trims to the same canonical payload is still an exact replay.
    const trimmedReplay = recordDecisionPlan(first.decisionPlan, { ...baseCommand, rationale: `  ${baseCommand.rationale}  ` })
    expect(trimmedReplay.events).toEqual(first.events)

    const conflictCodeOf = (mutation: Partial<typeof baseCommand>): string => {
      try {
        recordDecisionPlan(first.decisionPlan, { ...baseCommand, ...mutation })
      } catch (error) {
        expect(error).toBeInstanceOf(DecisionPlanError)
        return (error as DecisionPlanError).code
      }
      throw new Error('expected the replay to fail closed')
    }
    expect(conflictCodeOf({ rationale: 'Changed rationale' })).toBe('idempotency_conflict')
    expect(conflictCodeOf({ optionId: 'reschedule' })).toBe('idempotency_conflict')
  })

  it('rejects a forged exact replay from an unauthorized actor before touching the ledger', () => {
    // A caller forges a ledger event that exactly matches the unauthorized
    // command it is about to send. Authorization must fail before any replay
    // short-circuit can accept the forgery.
    const forgedEvent = {
      id: 'decision-decision:WO-24091:forged-v1',
      optionId: 'expedite' as const,
      rationale: 'Forged decision',
      actorId: 'user-dfoster',
      workOrderIntentId: 'WO-24091',
      occurredAt: DEMO_CLOCK_ISO,
      idempotencyKey: 'decision:WO-24091:forged-v1',
    }
    const forgedState = { ...createSafeResponsePlan(), events: [forgedEvent] }
    try {
      recordDecisionPlan(forgedState, {
        optionId: 'expedite',
        rationale: 'Forged decision',
        actorId: 'user-dfoster',
        workOrderIntentId: 'WO-24091',
        idempotencyKey: 'decision:WO-24091:forged-v1',
      })
      expect.unreachable('forged unauthorized replay was accepted')
    } catch (error) {
      expect(error).toBeInstanceOf(DecisionPlanError)
      expect((error as DecisionPlanError).code).toBe('authorization_denied')
    }
  })

  it('rejects replays against tampered ledgers: non-canonical IDs, missing options, duplicate IDs', () => {
    const codeOf = (fn: () => unknown): string => {
      try {
        fn()
      } catch (error) {
        expect(error).toBeInstanceOf(DecisionPlanError)
        return (error as DecisionPlanError).code
      }
      throw new Error('expected the command to fail')
    }
    const first = recordDecisionPlan(createSafeResponsePlan(), baseCommand)

    // Ledger event whose ID was tampered away from its canonical identity.
    const mismatched = {
      ...first.decisionPlan,
      events: [{ ...first.events[0], id: 'decision-decision:WO-24091:other-label' }],
    }
    expect(codeOf(() => recordDecisionPlan(mismatched, baseCommand))).toBe('audit_integrity')

    // Ledger carrying duplicate pre-existing event IDs.
    const duplicated = { ...first.decisionPlan, events: [first.events[0], { ...first.events[0] }] }
    expect(codeOf(() => recordDecisionPlan(duplicated, { ...baseCommand, idempotencyKey: 'decision:WO-24091:another' }))).toBe('audit_integrity')

    // Replay against a plan whose recorded option was tampered out of existence.
    const optionRemoved = { ...first.decisionPlan, options: first.decisionPlan.options.filter(option => option.id !== 'expedite') }
    expect(codeOf(() => recordDecisionPlan(optionRemoved, baseCommand))).toBe('unknown_option')
  })

  it('derives injective event IDs so distinct keys sharing suffixes coexist', () => {
    const plan = createSafeResponsePlan()
    const a = recordDecisionPlan(plan, { ...baseCommand, idempotencyKey: 'decision:WO-24091:a' })
    const b = recordDecisionPlan(a.decisionPlan, { ...baseCommand, optionId: 'reschedule', rationale: 'Second decision', idempotencyKey: 'decision:WO-24091:b' })
    const suffix = recordDecisionPlan(b.decisionPlan, { ...baseCommand, idempotencyKey: 'decision:WO-24091:b-a' })
    expect(suffix.events).toHaveLength(3)
    expect(new Set(suffix.events.map(event => event.id)).size).toBe(3)
  })

  it('yields identical events for identical flows', () => {
    const first = recordDecisionPlan(createSafeResponsePlan(), baseCommand)
    const second = recordDecisionPlan(createSafeResponsePlan(), baseCommand)
    expect(second.events).toEqual(first.events)
  })

  it('integrates all recorded decisions into Operating Memory idempotently and never truncates', () => {
    const investigation = createAssetRiskInvestigation()
    const first = recordDecisionPlan(createSafeResponsePlan(), { ...baseCommand, idempotencyKey: 'decision:WO-24091:one' })
    const second = recordDecisionPlan(first.decisionPlan, { ...baseCommand, optionId: 'reschedule', rationale: 'Fallback decision', idempotencyKey: 'decision:WO-24091:two' })

    // Two unintegrated decisions are both integrated, deterministically, in ledger order.
    const integrated = integrateDecisionEvents(investigation, second.events)
    const decisionEntries = integrated.timeline.filter(event => event.kind === 'decision.recorded')
    expect(decisionEntries).toHaveLength(2)
    expect(decisionEntries.map(event => event.id)).toEqual([
      'decision.recorded-decision-decision:WO-24091:one',
      'decision.recorded-decision-decision:WO-24091:two',
    ])
    expect(decisionEntries.every(event => event.actorId === SYNTHETIC_PERSONA.actorId)).toBe(true)
    expect(decisionEntries.every(event => event.occurredAt === DEMO_CLOCK_ISO)).toBe(true)
    expect(new Set(integrated.timeline.map(event => event.id)).size).toBe(integrated.timeline.length)

    // Repeated integration is a no-op: no duplicate timeline IDs, identical timeline.
    const replayed = integrateDecisionEvents(integrated, second.events)
    expect(replayed.timeline).toEqual(integrated.timeline)

    // Integrating a superset ledger appends only the missing decision.
    const partial = integrateDecisionEvents(investigation, first.events)
    const caughtUp = integrateDecisionEvents(partial, second.events)
    expect(caughtUp.timeline).toEqual(integrated.timeline)
  })

  it('fails closed when asked to integrate invalid or conflicting decision events', () => {
    const investigation = createAssetRiskInvestigation()
    const recorded = recordDecisionPlan(createSafeResponsePlan(), baseCommand)
    const valid = recorded.events[0]

    const codeOf = (fn: () => unknown): string => {
      try {
        fn()
      } catch (error) {
        expect(error).toBeInstanceOf(DecisionPlanError)
        return (error as DecisionPlanError).code
      }
      throw new Error('expected integration to fail')
    }

    // Non-canonical event ID.
    expect(codeOf(() => integrateDecisionEvents(investigation, [{ ...valid, id: 'decision-decision:WO-24091:other' }]))).toBe('audit_integrity')
    // Unauthorized recorded actor.
    expect(codeOf(() => integrateDecisionEvents(investigation, [{ ...valid, actorId: 'user-dfoster' }]))).toBe('authorization_denied')
    // Empty rationale.
    expect(codeOf(() => integrateDecisionEvents(investigation, [{ ...valid, rationale: '  ' }]))).toBe('rationale_required')
    // Timeline already holds the derived ID with different content: never overwritten or duplicated.
    const integrated = integrateDecisionEvents(investigation, [valid])
    const conflicting = { ...valid, rationale: 'Rewritten history' }
    expect(codeOf(() => integrateDecisionEvents(integrated, [conflicting]))).toBe('audit_integrity')
  })

  it('requires a non-empty rationale with the typed rationale_required error', () => {
    for (const rationale of ['', '   ', '\n\t ']) {
      try {
        recordDecisionPlan(createSafeResponsePlan(), { ...baseCommand, rationale })
        expect.unreachable('empty rationale was accepted')
      } catch (error) {
        expect(error).toBeInstanceOf(DecisionPlanError)
        expect((error as DecisionPlanError).code).toBe('rationale_required')
      }
    }
  })
})
