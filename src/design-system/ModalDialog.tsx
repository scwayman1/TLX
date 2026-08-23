import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { isModalActive, isTopModal, registerModal, unregisterModal } from './modalStack'

const focusableSelector = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',')

type ModalDialogProps = {
  title: string
  onClose: () => void
  children: ReactNode
  variant?: 'dialog' | 'drawer' | 'command' | 'mobile-drawer'
  labelledBy?: string
  hideDefaultHeader?: boolean
}

export function ModalDialog({ title, onClose, children, variant = 'dialog', labelledBy, hideDefaultHeader = false }: ModalDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const modalIdRef = useRef<number | null>(null)
  const titleId = labelledBy ?? `modal-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    const background = Array.from(document.querySelectorAll<HTMLElement>('[data-modal-background]'))
    const priorInert = new Map(background.map(element => [element, element.inert]))
    const modalId = registerModal()
    modalIdRef.current = modalId
    background.forEach(element => { element.inert = true })
    const dialog = dialogRef.current
    const first = dialog?.querySelector<HTMLElement>(focusableSelector)
    first?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isTopModal(modalId)) return
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !dialog) return
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
      if (!focusable.length) return
      const firstItem = focusable[0]
      const lastItem = focusable.at(-1)!
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault()
        firstItem.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      unregisterModal(modalId)
      modalIdRef.current = null
      background.forEach(element => { element.inert = priorInert.get(element) ?? false })
      if (!document.body.contains(previouslyFocused) || isModalActive()) return
      previouslyFocused?.focus()
    }
  }, [])

  return createPortal(
    <div className={`modal-layer ${variant === 'drawer' || variant === 'mobile-drawer' ? 'drawer-layer' : ''}`}>
      <button className="modal-scrim" aria-label={`Close ${title}`} onClick={() => {
        if (modalIdRef.current !== null && isTopModal(modalIdRef.current)) onCloseRef.current()
      }} />
      <div
        ref={dialogRef}
        className={`modal-surface modal-${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {hideDefaultHeader && !labelledBy && <h2 id={titleId} className="sr-only">{title}</h2>}
        {!hideDefaultHeader && <header className="modal-head">
          <h2 id={titleId}>{title}</h2>
          <button className="icon-button" aria-label={`Close ${title}`} onClick={onClose}><X size={18} /></button>
        </header>}
        {children}
      </div>
    </div>,
    document.body,
  )
}
