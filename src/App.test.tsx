import { fireEvent, render, screen } from '@testing-library/react'
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
})
