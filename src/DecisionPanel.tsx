import { useState } from 'react'
import {
  DecisionPlanError, authorizedApproverIdFor, createSafeResponsePlan, recordDecisionPlan,
  type DecisionPlanOptionId, type RecordedDecisionPlan, type SafeResponsePlan,
} from './domain/decision-plan'
import { SYNTHETIC_PERSONA } from './domain/demo-fixture'

// Synthetic safe-response decision panel (SCO-26). The recording actor is the
// single synthetic persona; the domain policy revalidates it on every command.
// `actorId` and `initialPlan` exist so tests can drive the hostile paths
// (unauthorized actor, forged ledgers) through the real UI mapping.
type DecisionPanelProps = {
  onRecorded: (recorded: RecordedDecisionPlan) => void
  actorId?: string
  initialPlan?: SafeResponsePlan
}

const approverDisplayFor = (optionId: DecisionPlanOptionId): string => {
  const approverId = authorizedApproverIdFor(optionId)
  return approverId === SYNTHETIC_PERSONA.actorId
    ? `${SYNTHETIC_PERSONA.name} (${SYNTHETIC_PERSONA.qualifier})`
    : approverId
}

// Each DecisionPlanError code maps to exactly one visible region and message:
// selection problems to the option region, rationale problems to the
// rationale region, and authorization/idempotency/audit failures to the
// decision-integrity region — never disguised as a field validation.
const INTEGRITY_MESSAGES: Record<string, string> = {
  authorization_denied: 'Decision blocked: this actor is not the authorized synthetic approver for the selected option.',
  idempotency_conflict: 'Decision blocked: this idempotency key was already used for a different decision payload. Reset the demo to replay.',
  audit_integrity: 'Decision blocked: the audit ledger failed integrity validation, so no event was recorded.',
  invalid_idempotency_key: 'Decision blocked: the idempotency key is not in the canonical decision:<work-order>:<label> form.',
}

export function DecisionPanel({ onRecorded, actorId = SYNTHETIC_PERSONA.actorId, initialPlan }: DecisionPanelProps) {
  const [plan, setPlan] = useState<SafeResponsePlan>(() => initialPlan ?? createSafeResponsePlan())
  const [recorded, setRecorded] = useState<RecordedDecisionPlan | null>(null)
  const [selected, setSelected] = useState<DecisionPlanOptionId | null>(null)
  const [rationale, setRationale] = useState('')
  const [optionError, setOptionError] = useState('')
  const [rationaleError, setRationaleError] = useState('')
  const [integrityError, setIntegrityError] = useState('')

  const record = () => {
    let blocked = false
    if (!selected) { setOptionError('Select a safe-response option before recording'); blocked = true } else setOptionError('')
    if (!rationale.trim()) { setRationaleError('Decision rationale is required'); blocked = true } else setRationaleError('')
    if (blocked) return
    setIntegrityError('')
    try {
      const result = recordDecisionPlan(plan, {
        optionId: selected as DecisionPlanOptionId,
        rationale,
        actorId,
        workOrderIntentId: 'WO-24091',
        idempotencyKey: `decision:WO-24091:${selected}-v1`,
      })
      // Operating Memory integration must succeed before this panel claims the
      // decision is recorded — a failed audit write is never a silent success.
      onRecorded(result)
      setPlan(result.decisionPlan)
      setRecorded(result)
    } catch (error) {
      if (error instanceof DecisionPlanError) {
        if (error.code === 'unknown_option') setOptionError('The selected option is not a valid safe-response option')
        else if (error.code === 'rationale_required') setRationaleError('Decision rationale is required')
        else setIntegrityError(INTEGRITY_MESSAGES[error.code])
        return
      }
      throw error
    }
  }

  if (recorded) {
    const event = recorded.events.at(-1)
    const selectedOption = recorded.decisionPlan.options.find(option => option.id === recorded.decisionPlan.selectedOptionId)
    return <div className="tool-result decision-recorded">
      <b>Decision recorded · {selectedOption?.label}</b>
      <p>{recorded.decisionPlan.boundaryStatement}</p>
      <p>Synthetic action only · No supplier was contacted, nothing was assigned, repaired, or returned to service, and no device command was issued.</p>
      <dl className="decision-audit">
        <div><dt>Linked work-order intent</dt><dd>{event?.workOrderIntentId}</dd></div>
        <div><dt>Rationale</dt><dd>{event?.rationale}</dd></div>
        <div><dt>Actor</dt><dd>{event?.actorId}<small> · {SYNTHETIC_PERSONA.qualifier}</small></dd></div>
        <div><dt>Recorded at</dt><dd>{event?.occurredAt}</dd></div>
        <div><dt>Event</dt><dd>{event?.id}</dd></div>
      </dl>
    </div>
  }

  return <section className="decision-panel" aria-labelledby="decision-plan-heading">
    <h2 id="decision-plan-heading">Safe response plan</h2>
    <p className="decision-note">Synthetic decision only · no reservation, purchase, supplier contact, work assignment, repair, return to service, device command, or production integration.</p>
    <fieldset className="decision-options">
      <legend>Safe response option</legend>
      {plan.options.map(option => (
        <label key={option.id} className="decision-option">
          <input type="radio" name="safe-response-option"
            checked={selected === option.id}
            onChange={() => { setSelected(option.id); setOptionError('') }}
            aria-invalid={optionError ? true : false}
            aria-describedby={optionError ? 'safe-response-option-error' : undefined}/>
          <span className="decision-option-body">
            <b>{option.label}</b>
            <small>Trade-off: {option.tradeOff}</small>
            <small>Evidence: {option.evidenceSummary}</small>
            <small>Confidence: {option.confidence}</small>
            <small>Quote freshness: {option.quoteFreshness}</small>
            <small>Required approver: {approverDisplayFor(option.id)}</small>
          </span>
        </label>
      ))}
      {optionError && <p id="safe-response-option-error" className="decision-error" role="alert">{optionError}</p>}
    </fieldset>
    <div className="rationale-field">
      <label htmlFor="decision-rationale">Decision rationale</label>
      <textarea id="decision-rationale" rows={2} value={rationale}
        onChange={event => { setRationale(event.target.value); if (rationaleError) setRationaleError('') }}
        aria-invalid={rationaleError ? true : false}
        aria-describedby={rationaleError ? 'decision-rationale-error' : undefined}/>
      {rationaleError && <p id="decision-rationale-error" className="decision-error" role="alert">{rationaleError}</p>}
    </div>
    {integrityError && <p className="decision-error decision-integrity-error" role="alert">{integrityError}</p>}
    <button className="primary" onClick={record}>Record decision</button>
  </section>
}
