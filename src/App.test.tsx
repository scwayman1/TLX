import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'
import App from './App'
import { SYNTHETIC_PERSONA } from './domain/demo-fixture'

afterEach(cleanup)

const openCompletedLookup = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Investigate with agent' }))
  fireEvent.click(screen.getByRole('button', { name: 'Approve lookup' }))
  fireEvent.click(screen.getByRole('button', { name: 'Run approved tool' }))
}

describe('TelemetryX operating shell', () => {
  it('renders mission control and navigates to assets', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Mission control' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Assets/ }))
    expect(screen.getByRole('heading', { name: 'Fleet assets' })).toBeInTheDocument()
    expect(screen.getByText('2022 Ford F-550')).toBeInTheDocument()
  })

  it('opens an asset record from the fleet registry', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Assets/ }))
    fireEvent.click(screen.getByText('2022 Ford F-550'))
    expect(screen.getByRole('heading', { name: '2022 Ford F-550' })).toBeInTheDocument()
    expect(screen.getByText('Operating timeline')).toBeInTheDocument()
  })

  it('opens and closes global search with keyboard shortcuts', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(screen.getByRole('dialog', { name: 'Search and navigation' })).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Search and navigation' })).not.toBeInTheDocument()
  })

  it('opens a grounded investigation and requires approval before tool execution', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Investigate with agent' }))
    expect(screen.getByRole('heading', { name: 'Why is TRL-443 becoming a risk, and what should we do?' })).toBeInTheDocument()
    expect(screen.getByText('Human approval required')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Run approved tool' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Approve lookup' }))
    expect(screen.getByRole('button', { name: 'Run approved tool' })).toBeInTheDocument()
  })

  it('does not represent the unavailable brake assembly as internally reserved', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Parts & inventory/ }))
    expect(screen.getByText('External quote pending')).toBeInTheDocument()
    expect(screen.queryByText('Reserved')).not.toBeInTheDocument()
  })

  it('presents two safe-response options with no default and records an audited expedite decision', () => {
    render(<App />)
    openCompletedLookup()

    const expedite = screen.getByRole('radio', { name: /Expedite the quoted BA-14TL assembly/ })
    const reschedule = screen.getByRole('radio', { name: /Reschedule the Northstar deployment/ })
    expect(expedite).not.toBeChecked()
    expect(reschedule).not.toBeChecked()
    expect(screen.getByRole('group', { name: 'Safe response option' })).toBeInTheDocument()

    fireEvent.click(expedite)
    fireEvent.change(screen.getByLabelText('Decision rationale'), { target: { value: 'Deployment tomorrow depends on this trailer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Record decision' }))

    expect(screen.getByText(/Reservation\/purchase not executed · no supplier was contacted/)).toBeInTheDocument()
    expect(screen.getByText(/No supplier was contacted, nothing was assigned, repaired, or returned to service, and no device command was issued/)).toBeInTheDocument()
    const recordedPanel = screen.getByText(/^Decision recorded · /).closest('div') as HTMLElement
    expect(recordedPanel).toBeInTheDocument()
    expect(screen.getAllByText('decision-decision:WO-24091:expedite-v1').length).toBeGreaterThan(0)
    expect(screen.getAllByText(SYNTHETIC_PERSONA.actorId).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/synthetic persona — not authenticated/).length).toBeGreaterThan(0)
    expect(screen.queryByText(/user-dfoster/)).not.toBeInTheDocument()

    // The recorded decision is integrated into Operating memory.
    const memoryPanel = screen.getByText('Operating memory').closest('div.memory-panel') as HTMLElement
    const decisionEntry = within(memoryPanel).getByText(/Decision recorded: expedite/)
    expect(decisionEntry.textContent).toContain('WO-24091')
    expect(decisionEntry.textContent).toContain('decision-decision:WO-24091:expedite-v1')
  })

  it('fails safely with distinct accessible errors when no option or rationale is supplied', () => {
    render(<App />)
    openCompletedLookup()

    // Neither option nor rationale: both regions report, nothing is recorded.
    fireEvent.click(screen.getByRole('button', { name: 'Record decision' }))
    const optionAlert = screen.getByText('Select a safe-response option before recording')
    const rationaleAlert = screen.getByText('Decision rationale is required')
    expect(optionAlert).toHaveAttribute('role', 'alert')
    expect(rationaleAlert).toHaveAttribute('role', 'alert')
    expect(optionAlert.id).not.toBe(rationaleAlert.id)
    expect(screen.queryByText(/Reservation\/purchase not executed/)).not.toBeInTheDocument()

    const expedite = screen.getByRole('radio', { name: /Expedite the quoted BA-14TL assembly/ })
    expect(expedite).toHaveAttribute('aria-invalid', 'true')
    expect(expedite).toHaveAccessibleDescription('Select a safe-response option before recording')
    const rationale = screen.getByLabelText('Decision rationale')
    expect(rationale).toHaveAttribute('aria-invalid', 'true')
    expect(rationale).toHaveAccessibleDescription('Decision rationale is required')

    // Selecting an option clears only the option region; rationale is still required.
    fireEvent.click(expedite)
    expect(expedite).toHaveAttribute('aria-invalid', 'false')
    expect(screen.queryByText('Select a safe-response option before recording')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Record decision' }))
    expect(screen.getByText('Decision rationale is required')).toBeInTheDocument()
    expect(screen.queryByText(/^Decision recorded · /)).not.toBeInTheDocument()
  })

  it('never exposes decision controls on the rejection path', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Investigate with agent' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }))
    expect(screen.getByText(/No tool activity occurred/)).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Record decision' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Decision rationale')).not.toBeInTheDocument()
  })

  it('yields identical complete Operating Memory across reset, close/reopen, and separate instances', () => {
    const runFlow = (fresh: boolean) => {
      if (fresh) fireEvent.click(screen.getByRole('button', { name: 'Investigate with agent' }))
      fireEvent.click(screen.getByRole('button', { name: 'Approve lookup' }))
      fireEvent.click(screen.getByRole('button', { name: 'Run approved tool' }))
      fireEvent.click(screen.getByRole('radio', { name: /Reschedule the Northstar deployment/ }))
      fireEvent.change(screen.getByLabelText('Decision rationale'), { target: { value: 'Quote cannot be verified' } })
      fireEvent.click(screen.getByRole('button', { name: 'Record decision' }))
    }
    const captureMemory = (): string[] => {
      const memoryPanel = screen.getByText('Operating memory').closest('div.memory-panel') as HTMLElement
      return Array.from(memoryPanel.querySelectorAll('span')).map(node =>
        Array.from(node.querySelectorAll('b, small')).map(part => part.textContent).join('|'),
      ).filter(text => text.length > 0)
    }

    render(<App />)
    runFlow(true)
    const firstMemory = captureMemory()
    expect(firstMemory.some(entry => entry.includes('Decision recorded: reschedule'))).toBe(true)

    // Reset restores the initial state; replaying the identical flow reproduces identical audit records.
    fireEvent.click(screen.getByRole('button', { name: 'Reset demo' }))
    expect(screen.queryByText(/^Decision recorded · /)).not.toBeInTheDocument()
    expect(screen.getByText('Human approval required')).toBeInTheDocument()
    runFlow(false)
    expect(captureMemory()).toEqual(firstMemory)

    // Close and reopen, replay again: identical.
    fireEvent.click(screen.getByRole('button', { name: '← Mission control' }))
    runFlow(true)
    expect(captureMemory()).toEqual(firstMemory)

    // A separate App instance running the identical flow agrees completely.
    cleanup()
    render(<App />)
    runFlow(true)
    expect(captureMemory()).toEqual(firstMemory)
  })

  it('shows one agreeing synthetic persona as decision owner, approver requirement, and recorded actor', () => {
    render(<App />)
    // The initiating mission-control surface names the persona as decision
    // owner WITH the synthetic qualifier — not just the name.
    const ownerCard = screen.getByText(/Decision owner/).parentElement?.textContent ?? ''
    expect(ownerCard).toContain(SYNTHETIC_PERSONA.name)
    expect(ownerCard).toContain(SYNTHETIC_PERSONA.qualifier)
    expect(screen.queryByText(/Dana Foster/)).not.toBeInTheDocument()

    openCompletedLookup()
    // The approval surface carries the synthetic qualifier.
    fireEvent.click(screen.getByRole('button', { name: 'Reset demo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Approve lookup' }))
    const approvedBox = screen.getByText(`Approved by ${SYNTHETIC_PERSONA.name}`)
    expect(approvedBox.parentElement?.textContent).toContain(SYNTHETIC_PERSONA.qualifier)
    fireEvent.click(screen.getByRole('button', { name: 'Run approved tool' }))

    // Every option's required approver is the same persona, policy-derived, qualified.
    const approverLines = screen.getAllByText(/Required approver:/)
    expect(approverLines).toHaveLength(2)
    for (const line of approverLines) {
      expect(line.textContent).toContain(SYNTHETIC_PERSONA.name)
      expect(line.textContent).toContain(SYNTHETIC_PERSONA.qualifier)
    }
    expect(screen.queryByText(/Dana Foster/)).not.toBeInTheDocument()

    // The recorded decision names the same persona actor.
    fireEvent.click(screen.getByRole('radio', { name: /Expedite the quoted BA-14TL assembly/ }))
    fireEvent.change(screen.getByLabelText('Decision rationale'), { target: { value: 'Deployment tomorrow depends on this trailer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Record decision' }))
    expect(screen.getAllByText(SYNTHETIC_PERSONA.actorId).length).toBeGreaterThan(0)
  })

  it('gives every mission-control control an accessible name', () => {
    render(<App />)
    for (const button of screen.getAllByRole('button')) {
      expect(button, 'every button needs an accessible name').toHaveAccessibleName()
    }
  })

  it('supports the complete decision path from the keyboard', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Investigate with agent' }))
    await user.click(screen.getByRole('button', { name: 'Approve lookup' }))
    await user.click(screen.getByRole('button', { name: 'Run approved tool' }))

    const expedite = screen.getByRole('radio', { name: /Expedite the quoted BA-14TL assembly/ })
    expedite.focus()
    await user.keyboard(' ')
    expect(expedite).toBeChecked()

    await user.tab() // radio group -> rationale textarea
    const rationale = screen.getByLabelText('Decision rationale')
    expect(rationale).toHaveFocus()
    await user.keyboard('Keyboard-driven rationale')
    expect(rationale).toHaveValue('Keyboard-driven rationale')

    await user.tab() // rationale -> record button
    const record = screen.getByRole('button', { name: 'Record decision' })
    expect(record).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByText(/Reservation\/purchase not executed · no supplier was contacted/)).toBeInTheDocument()
  })
})
