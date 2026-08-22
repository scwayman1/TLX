import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup } from '@testing-library/react'
import App from './App'

afterEach(cleanup)

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

  it('presents two safe-response options and records an audited expedite decision', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Investigate with agent' }))
    fireEvent.click(screen.getByRole('button', { name: 'Approve lookup' }))
    fireEvent.click(screen.getByRole('button', { name: 'Run approved tool' }))

    expect(screen.getByRole('radio', { name: /Expedite the quoted BA-14TL assembly/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Reschedule the Northstar deployment/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Record decision' }))
    expect(screen.getByText('Decision rationale is required')).toBeInTheDocument()
    expect(screen.queryByText(/Reservation\/purchase not executed/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: /Expedite the quoted BA-14TL assembly/ }))
    fireEvent.change(screen.getByLabelText('Decision rationale'), { target: { value: 'Deployment tomorrow depends on this trailer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Record decision' }))

    expect(screen.getByText(/Reservation\/purchase not executed · no supplier was contacted/)).toBeInTheDocument()
    expect(screen.getByText(/user-dfoster/)).toBeInTheDocument()
    expect(screen.getByText('WO-24091')).toBeInTheDocument()
  })

  it('supports the decision-plan controls from the keyboard', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Investigate with agent' }))
    await user.click(screen.getByRole('button', { name: 'Approve lookup' }))
    await user.click(screen.getByRole('button', { name: 'Run approved tool' }))

    const expedite = screen.getByRole('radio', { name: /Expedite the quoted BA-14TL assembly/ })
    expedite.focus()
    await user.keyboard(' ')
    expect(expedite).toBeChecked()

    const rationale = screen.getByLabelText('Decision rationale')
    rationale.focus()
    await user.keyboard('Keyboard-driven rationale')
    expect(rationale).toHaveValue('Keyboard-driven rationale')

    const record = screen.getByRole('button', { name: 'Record decision' })
    await user.tab()
    expect(record).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByText(/Reservation\/purchase not executed · no supplier was contacted/)).toBeInTheDocument()
  })

  it('hides the decision plan when the vendor lookup is rejected', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Investigate with agent' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }))
    expect(screen.queryByRole('radio', { name: /Expedite the quoted BA-14TL assembly/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Record decision' })).not.toBeInTheDocument()
  })

  it('resets the decision plan deterministically from the investigation workspace', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Investigate with agent' }))
    fireEvent.click(screen.getByRole('button', { name: 'Approve lookup' }))
    fireEvent.click(screen.getByRole('button', { name: 'Run approved tool' }))
    fireEvent.click(screen.getByRole('radio', { name: /Reschedule the Northstar deployment/ }))
    fireEvent.change(screen.getByLabelText('Decision rationale'), { target: { value: 'Quote cannot be verified' } })
    fireEvent.click(screen.getByRole('button', { name: 'Record decision' }))
    expect(screen.getByText(/Deployment reschedule recorded in the synthetic workspace only/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reset demo' }))
    expect(screen.queryByText(/Deployment reschedule recorded in the synthetic workspace only/)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Why is TRL-443 becoming a risk, and what should we do?' })).toBeInTheDocument()
    expect(screen.getByText('Human approval required')).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: /Expedite the quoted BA-14TL assembly/ })).not.toBeInTheDocument()
  })
})
