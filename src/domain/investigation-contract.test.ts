import { describe, expect, it } from 'vitest'
import {
  approvePlan,
  createPlan,
  executeApprovedAction,
  transitionExecution,
  type ProposedAction,
} from './investigation-contract'

const consequentialAction: ProposedAction = {
  actionId: 'act-1',
  adapter: 'safe-stub',
  operation: 'request-part-expedite',
  targetRef: 'asset:TRL-443',
  safetyClass: 'consequential',
  impactPreview: 'Requests expedited delivery from the preferred vendor',
  idempotencyKey: 'inv-1:request-part-expedite:v1',
  preconditions: ['preferred vendor selected'],
  expectedResult: 'Expedite request accepted by the safe stub',
  recoveryPlan: 'Cancel the unsubmitted request',
}

describe('investigation approval contract', () => {
  it('binds approval to the exact plan version and action', () => {
    const plan = createPlan({
      planId: 'plan-1',
      investigationId: 'inv-1',
      version: 1,
      summary: 'Expedite the required brake assembly',
      evidenceIds: ['evi-1'],
      assumptions: [],
      unknowns: [],
      actions: [consequentialAction],
    })
    const decision = approvePlan(plan, {
      decisionId: 'dec-1',
      actorId: 'user-scott',
      approvedActionIds: ['act-1'],
      reason: 'Restore the asset safely',
      policySnapshot: 'policy:v1',
    })

    const execution = executeApprovedAction(plan, decision, 'act-1')

    expect(execution).toMatchObject({
      actionId: 'act-1',
      decisionId: 'dec-1',
      idempotencyKey: 'inv-1:request-part-expedite:v1',
      state: 'accepted',
      attempt: 1,
    })
  })

  it('invalidates approval when the plan version changes', () => {
    const original = createPlan({
      planId: 'plan-1', investigationId: 'inv-1', version: 1,
      summary: 'Original plan', evidenceIds: ['evi-1'], assumptions: [], unknowns: [],
      actions: [consequentialAction],
    })
    const decision = approvePlan(original, {
      decisionId: 'dec-1', actorId: 'user-scott', approvedActionIds: ['act-1'],
      reason: 'Approved original', policySnapshot: 'policy:v1',
    })
    const edited = createPlan({ ...original, version: 2, summary: 'Edited plan' })

    expect(() => executeApprovedAction(edited, decision, 'act-1')).toThrow(
      'Approval does not match plan version',
    )
  })

  it('denies execution for an action not explicitly approved', () => {
    const secondAction = { ...consequentialAction, actionId: 'act-2', idempotencyKey: 'inv-1:act-2:v1' }
    const plan = createPlan({
      planId: 'plan-1', investigationId: 'inv-1', version: 1,
      summary: 'Two possible actions', evidenceIds: ['evi-1'], assumptions: [], unknowns: [],
      actions: [consequentialAction, secondAction],
    })
    const decision = approvePlan(plan, {
      decisionId: 'dec-1', actorId: 'user-scott', approvedActionIds: ['act-1'],
      reason: 'Only the first action is approved', policySnapshot: 'policy:v1',
    })

    expect(() => executeApprovedAction(plan, decision, 'act-2')).toThrow(
      'Action was not explicitly approved',
    )
  })

  it('keeps prohibited actions impossible even when included in an approval', () => {
    const prohibited = { ...consequentialAction, safetyClass: 'prohibited' as const }
    const plan = createPlan({
      planId: 'plan-1', investigationId: 'inv-1', version: 1,
      summary: 'Unsafe plan', evidenceIds: ['evi-1'], assumptions: [], unknowns: [],
      actions: [prohibited],
    })
    const decision = approvePlan(plan, {
      decisionId: 'dec-1', actorId: 'user-scott', approvedActionIds: ['act-1'],
      reason: 'Should not override policy', policySnapshot: 'policy:v1',
    })

    expect(() => executeApprovedAction(plan, decision, 'act-1')).toThrow(
      'Prohibited actions cannot be executed',
    )
  })

  it('returns the existing logical execution for a duplicate idempotency key', () => {
    const plan = createPlan({
      planId: 'plan-1', investigationId: 'inv-1', version: 1,
      summary: 'Safe plan', evidenceIds: ['evi-1'], assumptions: [], unknowns: [],
      actions: [consequentialAction],
    })
    const decision = approvePlan(plan, {
      decisionId: 'dec-1', actorId: 'user-scott', approvedActionIds: ['act-1'],
      reason: 'Proceed', policySnapshot: 'policy:v1',
    })
    const first = executeApprovedAction(plan, decision, 'act-1')

    const duplicate = executeApprovedAction(plan, decision, 'act-1', [first])

    expect(duplicate).toBe(first)
    expect(duplicate.attempt).toBe(1)
  })

  it('does not confuse acceptance with application', () => {
    const plan = createPlan({
      planId: 'plan-1', investigationId: 'inv-1', version: 1,
      summary: 'Safe plan', evidenceIds: ['evi-1'], assumptions: [], unknowns: [],
      actions: [consequentialAction],
    })
    const decision = approvePlan(plan, {
      decisionId: 'dec-1', actorId: 'user-scott', approvedActionIds: ['act-1'],
      reason: 'Proceed', policySnapshot: 'policy:v1',
    })
    const accepted = executeApprovedAction(plan, decision, 'act-1')

    expect(() => transitionExecution(accepted, 'applied')).toThrow(
      'Invalid execution transition: accepted -> applied',
    )
    const dispatched = transitionExecution(accepted, 'dispatched')
    const acknowledged = transitionExecution(dispatched, 'acknowledged')
    expect(transitionExecution(acknowledged, 'applied').state).toBe('applied')
  })

  it('rejects approval requests that name actions outside the plan', () => {
    const plan = createPlan({
      planId: 'plan-1', investigationId: 'inv-1', version: 1,
      summary: 'Safe plan', evidenceIds: ['evi-1'], assumptions: [], unknowns: [],
      actions: [consequentialAction],
    })

    expect(() => approvePlan(plan, {
      decisionId: 'dec-1', actorId: 'user-scott', approvedActionIds: ['act-missing'],
      reason: 'Invalid approval', policySnapshot: 'policy:v1',
    })).toThrow('Approval references an action outside the plan')
  })

  it('treats timeout as unknown and requires reconciliation before another outcome', () => {
    const plan = createPlan({
      planId: 'plan-1', investigationId: 'inv-1', version: 1,
      summary: 'Safe plan', evidenceIds: ['evi-1'], assumptions: [], unknowns: [],
      actions: [consequentialAction],
    })
    const decision = approvePlan(plan, {
      decisionId: 'dec-1', actorId: 'user-scott', approvedActionIds: ['act-1'],
      reason: 'Proceed', policySnapshot: 'policy:v1',
    })
    const dispatched = transitionExecution(
      executeApprovedAction(plan, decision, 'act-1'),
      'dispatched',
    )

    const timedOut = transitionExecution(dispatched, 'timed_out')

    expect(() => transitionExecution(timedOut, 'dispatched')).toThrow(
      'Invalid execution transition: timed_out -> dispatched',
    )
    expect(transitionExecution(timedOut, 'reconciling').state).toBe('reconciling')
  })
})
