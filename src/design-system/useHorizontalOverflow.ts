import { useCallback, useLayoutEffect, useRef, useState } from 'react'

export function useHorizontalOverflow<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [hasOverflow, setHasOverflow] = useState(false)
  const measure = useCallback(() => {
    const element = ref.current
    if (!element) return
    setHasOverflow(element.scrollWidth > element.clientWidth)
  }, [])

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    measure()

    const onResize = () => measure()
    window.addEventListener('resize', onResize)

    let resizeObserver: ResizeObserver | undefined
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measure)
      resizeObserver.observe(element)
      if (element.firstElementChild) resizeObserver.observe(element.firstElementChild)
    }

    const mutationObserver = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(measure)
    mutationObserver?.observe(element, { childList: true, subtree: true, characterData: true })

    return () => {
      window.removeEventListener('resize', onResize)
      resizeObserver?.disconnect()
      mutationObserver?.disconnect()
    }
  }, [measure])

  return { ref, hasOverflow, measure }
}
