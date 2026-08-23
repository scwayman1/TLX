import { fireEvent, render, screen, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DecisionPanel } from './DecisionPanel'
import { DecisionPlanError, createSafeResponsePlan } from './domain/decision-plan'
import { DEMO_CLOCK_ISO, SYNTHETIC_PERSONA } from './domain/demo-fixture'

afterEach(cleanup)

const submitExpedite = () => {
  fireEvent.click(screen.getByRole('radio', { name: /Expedite the quoted BA-14TL assembly/ }))
  fireEvent.change(screen.getByLabelText('Decision rationale'), { target: { value: 'Deployment tomorrow depends on this trailer' } })
  fireEvent.click(screen.getByRole('button', { name: 'Record decision' }))
}

describe('decision panel error-region mapping', () => {
  it('never claims a recorded decision when Operating Memory integration fails', () => {
    render(<DecisionPanel onRecorded={() => { throw new DecisionPlanError('audit_integrity', 'integration failed') }} />)
    submitExpedite()
    // The recorded view must not render; the integrity region must.
    expect(screen.queryByText(/^Decision recorded · /)).not.toBeInTheDocument()
    expect(screen.getByText(/audit ledger failed integrity validation/)).toHaveAttribute('role', 'alert')
  })

  it('routes authorization failures to the decision-integrity region, not a field error', () => {
    const onRecorded = vi.fn()
    render(<DecisionPanel onRecorded={onRecorded} actorId="user-dfoster" />)
    submitExpedite()

    const integrity = screen.getByText(/not the authorized synthetic approver/)
    expect(integrity).toHaveAttribute('role', 'alert')
    expect(integrity.className).toContain('decision-integrity-error')
    expect(screen.queryByText('Select a safe-response option before recording')).not.toBeInTheDocument()
    expect(screen.queryByText('Decision rationale is required')).not.toBeInTheDocument()
    expect(onRecorded).not.toHaveBeenCalled()
    expect(screen.queryByText(/^Decision recorded · /)).not.toBeInTheDocument()
  })

  it('routes idempotency conflicts and audit-integrity failures to distinct integrity messages', () => {
    // Prior ledger event under the canonical key this submission will reuse,
    // but with a different payload: replay must fail closed as a conflict.
    const conflictedPlan = {
      ...createSafeResponsePlan(),
      events: [{
        id: 'decision-decision:WO-24091:expedite-v1',
        optionId: 'expedite' as const,
        rationale: 'A different recorded rationale',
        actorId: SYNTHETIC_PERSONA.actorId,
        workOrderIntentId: 'WO-24091',
        occurredAt: DEMO_CLOCK_ISO,
        idempotencyKey: 'decision:WO-24091:expedite-v1',
      }],
    }
    const onRecorded = vi.fn()
    render(<DecisionPanel onRecorded={onRecorded} initialPlan={conflictedPlan} />)
    submitExpedite()
    expect(screen.getByText(/already used for a different decision payload/)).toHaveAttribute('role', 'alert')
    expect(onRecorded).not.toHaveBeenCalled()
    cleanup()

    // Ledger whose event ID was tampered away from its canonical identity.
    const tamperedPlan = {
      ...createSafeResponsePlan(),
      events: [{
        id: 'decision-decision:WO-24091:not-the-canonical-id',
        optionId: 'reschedule' as const,
        rationale: 'Prior decision',
        actorId: SYNTHETIC_PERSONA.actorId,
        workOrderIntentId: 'WO-24091',
        occurredAt: DEMO_CLOCK_ISO,
        idempotencyKey: 'decision:WO-24091:prior',
      }],
    }
    render(<DecisionPanel onRecorded={onRecorded} initialPlan={tamperedPlan} />)
    submitExpedite()
    expect(screen.getByText(/audit ledger failed integrity validation/)).toHaveAttribute('role', 'alert')
    expect(onRecorded).not.toHaveBeenCalled()
  })
})
