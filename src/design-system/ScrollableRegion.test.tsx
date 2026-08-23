import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ScrollableRegion } from './ScrollableRegion'

const observers: Array<{ callback: ResizeObserverCallback; disconnect: ReturnType<typeof vi.fn> }> = []

class ResizeObserverMock {
  callback: ResizeObserverCallback
  disconnect = vi.fn()
  observe = vi.fn()
  unobserve = vi.fn()

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
    observers.push(this)
  }
}

function setDimensions(element: HTMLElement, clientWidth: number, scrollWidth: number) {
  Object.defineProperties(element, {
    clientWidth: { configurable: true, value: clientWidth },
    scrollWidth: { configurable: true, value: scrollWidth },
  })
}

beforeEach(() => {
  observers.length = 0
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('ScrollableRegion', () => {
  it('keeps a non-overflowing desktop table region out of the tab order', () => {
    render(<ScrollableRegion label="Desktop table"><table><tbody><tr><td>Short</td></tr></tbody></table></ScrollableRegion>)
    const region = screen.getByRole('region', { name: 'Desktop table' })
    setDimensions(region, 900, 900)
    act(() => observers[0].callback([], observers[0] as unknown as ResizeObserver))

    expect(region).not.toHaveAttribute('tabindex')
  })

  it('makes an overflowing narrow table region keyboard focusable', () => {
    render(<ScrollableRegion label="Narrow table"><table><tbody><tr><td>Wide content</td></tr></tbody></table></ScrollableRegion>)
    const region = screen.getByRole('region', { name: 'Narrow table' })
    setDimensions(region, 320, 720)
    act(() => observers[0].callback([], observers[0] as unknown as ResizeObserver))

    expect(region).toHaveAttribute('tabindex', '0')
  })

  it('updates focusability when resize or content changes overflow', () => {
    const { rerender } = render(<ScrollableRegion label="Changing table"><span>Short</span></ScrollableRegion>)
    const region = screen.getByRole('region', { name: 'Changing table' })
    setDimensions(region, 500, 500)
    act(() => observers[0].callback([], observers[0] as unknown as ResizeObserver))
    expect(region).not.toHaveAttribute('tabindex')

    setDimensions(region, 500, 800)
    rerender(<ScrollableRegion label="Changing table"><span>Content became substantially wider</span></ScrollableRegion>)
    act(() => observers[0].callback([], observers[0] as unknown as ResizeObserver))
    expect(region).toHaveAttribute('tabindex', '0')

    setDimensions(region, 900, 800)
    act(() => observers[0].callback([], observers[0] as unknown as ResizeObserver))
    expect(region).not.toHaveAttribute('tabindex')
    expect(observers[0].disconnect).not.toHaveBeenCalled()
  })

  it('falls back to window resize measurement when ResizeObserver is unavailable', () => {
    vi.stubGlobal('ResizeObserver', undefined)
    render(<ScrollableRegion label="Fallback table"><span>Content</span></ScrollableRegion>)
    const region = screen.getByRole('region', { name: 'Fallback table' })
    setDimensions(region, 300, 600)

    act(() => window.dispatchEvent(new Event('resize')))

    expect(region).toHaveAttribute('tabindex', '0')
  })
})
