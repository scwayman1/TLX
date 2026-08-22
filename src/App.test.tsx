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
})
