import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { ModalDialog } from './ModalDialog'
import { getModalManagerSnapshot, resetModalManagerForTests } from './modalStack'

afterEach(() => {
  cleanup()
  resetModalManagerForTests()
})

function NestedDialogs() {
  const [lowerOpen, setLowerOpen] = useState(true)
  const [upperOpen, setUpperOpen] = useState(false)
  return <div>
    <button data-modal-background>Background action</button>
    {lowerOpen && <ModalDialog title="Lower layer" onClose={() => setLowerOpen(false)}>
      <div className="modal-body">
        <button onClick={() => setUpperOpen(true)}>Open upper layer</button>
        <button>Lower alternate</button>
      </div>
    </ModalDialog>}
    {upperOpen && <ModalDialog title="Upper layer" onClose={() => setUpperOpen(false)}>
      <div className="modal-body"><button>Upper action</button></div>
    </ModalDialog>}
  </div>
}

describe('central modal ownership', () => {
  it('makes only the top layer operable and transfers focus to the exposed layer on top close', async () => {
    const user = userEvent.setup()
    render(<NestedDialogs />)
    const opener = screen.getByRole('button', { name: 'Open upper layer' })
    await user.click(opener)

    const lower = screen.getByRole('dialog', { name: 'Lower layer', hidden: true })
    const upper = screen.getByRole('dialog', { name: 'Upper layer' })
    expect(lower.closest('.modal-layer')).toHaveProperty('inert', true)
    expect(lower.closest('.modal-layer')).toHaveAttribute('aria-hidden', 'true')
    expect(upper).toContainElement(document.activeElement as HTMLElement)

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog', { name: 'Upper layer' })).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Lower layer' }).closest('.modal-layer')).not.toHaveAttribute('aria-hidden')
    expect(opener).toHaveFocus()
  })

  it('keeps the background inert when a lower layer unmounts before the top layer', () => {
    const lowerClose = vi.fn()
    const upperClose = vi.fn()
    const { rerender } = render(<>
      <button data-modal-background>Background</button>
      <ModalDialog key="lower" title="Lower" onClose={lowerClose}><button>Lower action</button></ModalDialog>
      <ModalDialog key="upper" title="Upper" onClose={upperClose}><button>Upper action</button></ModalDialog>
    </>)

    rerender(<>
      <button data-modal-background>Background</button>
      <ModalDialog key="upper" title="Upper" onClose={upperClose}><button>Upper action</button></ModalDialog>
    </>)

    expect(screen.getByRole('button', { name: 'Background', hidden: true })).toHaveProperty('inert', true)
    expect(screen.getByRole('dialog', { name: 'Upper' })).toContainElement(document.activeElement as HTMLElement)
    expect(getModalManagerSnapshot()).toMatchObject({ depth: 1, backgroundOwned: true })
  })

  it('gives only the top layer Escape and backdrop ownership', () => {
    const lowerClose = vi.fn()
    const upperClose = vi.fn()
    render(<>
      <div data-modal-background>Background</div>
      <ModalDialog title="Lower" onClose={lowerClose}><button>Lower action</button></ModalDialog>
      <ModalDialog title="Upper" onClose={upperClose}><button>Upper action</button></ModalDialog>
    </>)

    const scrims = Array.from(document.querySelectorAll<HTMLButtonElement>('.modal-scrim'))
    fireEvent.click(scrims[0])
    expect(lowerClose).not.toHaveBeenCalled()
    fireEvent.click(scrims[1])
    expect(upperClose).toHaveBeenCalledTimes(1)

    cleanup()
    render(<>
      <div data-modal-background>Background</div>
      <ModalDialog title="Lower" onClose={lowerClose}><button>Lower action</button></ModalDialog>
      <ModalDialog title="Upper" onClose={upperClose}><button>Upper action</button></ModalDialog>
    </>)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(upperClose).toHaveBeenCalledTimes(2)
    expect(lowerClose).not.toHaveBeenCalled()
  })

  it('recovers focus into the exposed modal when the removed top layer held focus', async () => {
    const user = userEvent.setup()
    render(<NestedDialogs />)
    await user.click(screen.getByRole('button', { name: 'Open upper layer' }))
    expect(screen.getByRole('dialog', { name: 'Upper layer' })).toContainElement(document.activeElement as HTMLElement)

    await user.keyboard('{Escape}')

    const lower = screen.getByRole('dialog', { name: 'Lower layer' })
    expect(lower).toContainElement(document.activeElement as HTMLElement)
  })

  it('restores exact original background state after final cleanup and resets deterministically', () => {
    const originallyInert = document.createElement('button')
    originallyInert.dataset.modalBackground = ''
    originallyInert.inert = true
    originallyInert.setAttribute('aria-hidden', 'true')
    const originallyActive = document.createElement('button')
    originallyActive.dataset.modalBackground = ''
    originallyActive.inert = false
    document.body.append(originallyInert, originallyActive)
    originallyActive.focus()

    const { unmount } = render(
      <ModalDialog title="Only layer" onClose={() => undefined}><button>Action</button></ModalDialog>,
    )
    expect(getModalManagerSnapshot()).toMatchObject({ depth: 1, backgroundOwned: true })

    unmount()

    expect(originallyInert.inert).toBe(true)
    expect(originallyInert).toHaveAttribute('aria-hidden', 'true')
    expect(originallyActive.inert).toBe(false)
    expect(originallyActive).not.toHaveAttribute('aria-hidden')
    expect(originallyActive).toHaveFocus()
    const snapshot = getModalManagerSnapshot()
    expect(snapshot).toEqual({ depth: 0, topId: null, backgroundOwned: false })
    resetModalManagerForTests()
    expect(getModalManagerSnapshot()).toEqual(snapshot)
    originallyInert.remove()
    originallyActive.remove()
  })
})
