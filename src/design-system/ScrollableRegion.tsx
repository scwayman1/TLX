import type { ReactNode } from 'react'
import { useHorizontalOverflow } from './useHorizontalOverflow'

type ScrollableRegionProps = {
  label: string
  children: ReactNode
  className?: string
}

export function ScrollableRegion({ label, children, className = 'table-wrap' }: ScrollableRegionProps) {
  const { ref, hasOverflow } = useHorizontalOverflow<HTMLDivElement>()
  return <div ref={ref} className={className} role="region" aria-label={label} tabIndex={hasOverflow ? 0 : undefined}>
    {children}
  </div>
}
