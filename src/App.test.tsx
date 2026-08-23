import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import App from './App'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function useNarrowViewport(matches = true) {
  const listeners = new Set<() => void>()
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: query === '(max-width: 760px)' ? matches : false,
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })))
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

  it('opens the component lab from the explicit demo control', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Open design system lab' }))

    expect(await screen.findByRole('heading', { name: 'TelemetryX design system' })).toBeInTheDocument()
    expect(screen.getByText('Synthetic component fixtures')).toBeInTheDocument()
  })

  it('names the fleet-health date control for assistive technology', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: 'Change fleet health reporting period' })).toBeInTheDocument()
  })

  it('exposes mobile navigation state and target semantics', () => {
    render(<App />)

    const menu = screen.getByRole('button', { name: 'Open navigation' })
    expect(menu).toHaveAttribute('aria-expanded', 'false')
    expect(menu).toHaveAttribute('aria-controls', 'primary-navigation')
  })

  it('contains command-palette focus and restores its trigger', async () => {
    const user = userEvent.setup()
    render(<App />)
    const trigger = screen.getByRole('button', { name: /Search assets/ })

    await user.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Search and navigation' })
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
    await user.tab({ shift: true })
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
    await user.keyboard('{Escape}')
    expect(trigger).toHaveFocus()
  })

  it('wraps command-palette focus forward and reverse and closes from its backdrop', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Search assets/ }))
    const dialog = screen.getByRole('dialog', { name: 'Search and navigation' })
    const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])'))

    controls.at(-1)!.focus()
    await user.tab()
    expect(controls[0]).toHaveFocus()
    controls[0].focus()
    await user.tab({ shift: true })
    expect(controls.at(-1)).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Close Search and navigation' }))
    expect(screen.queryByRole('dialog', { name: 'Search and navigation' })).not.toBeInTheDocument()
  })

  it('preserves a previously inert closed mobile sidebar after search closes', async () => {
    useNarrowViewport()
    const user = userEvent.setup()
    render(<App />)
    const sidebar = screen.getByLabelText('Primary workspace', { selector: 'aside' })
    expect(sidebar).toHaveProperty('inert', true)

    await user.click(screen.getByRole('button', { name: /Search assets/ }))
    await user.keyboard('{Escape}')

    expect(sidebar).toHaveProperty('inert', true)
  })

  it('implements the narrow mobile drawer focus, inertness, Escape, scrim, and restoration contract', async () => {
    useNarrowViewport()
    const user = userEvent.setup()
    render(<App />)
    const trigger = screen.getByRole('button', { name: 'Open navigation' })

    await user.click(trigger)
    const drawer = screen.getByRole('dialog', { name: 'Primary workspace' })
    expect(drawer).toContainElement(document.activeElement as HTMLElement)
    expect(screen.getByRole('main')).toHaveProperty('inert', true)
    expect(document.querySelector('.topbar')).toHaveProperty('inert', true)

    const controls = Array.from(drawer.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'))
    controls.at(-1)!.focus()
    await user.tab()
    expect(controls[0]).toHaveFocus()
    controls[0].focus()
    await user.tab({ shift: true })
    expect(controls.at(-1)).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Primary workspace' })).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()

    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: 'Close Primary workspace' }))
    expect(screen.queryByRole('dialog', { name: 'Primary workspace' })).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('prevents search from stacking over an active asset or mobile drawer', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Assets/ }))
    await user.click(screen.getByText('2022 Ford F-550'))
    expect(screen.getByRole('dialog', { name: '2022 Ford F-550' })).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(screen.queryByRole('dialog', { name: 'Search and navigation' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
  })

  it('prevents search from stacking over the design-lab modal', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Open design system lab' }))
    await user.click(await screen.findByRole('button', { name: 'Open focus example' }))
    expect(screen.getByRole('dialog', { name: 'Review synthetic approval' })).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    expect(screen.queryByRole('dialog', { name: 'Search and navigation' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
  })

  it('names the production table scroll regions for keyboard users', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('region', { name: 'Active work orders table' })).toHaveAttribute('tabindex', '0')

    await user.click(screen.getByRole('button', { name: /Assets/ }))
    expect(screen.getByRole('region', { name: 'Fleet assets table' })).toHaveAttribute('tabindex', '0')
  })
})
