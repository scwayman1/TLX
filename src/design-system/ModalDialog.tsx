import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { registerModal, requestModalClose, unregisterModal } from './modalStack'

type ModalDialogProps = {
  title: string
  onClose: () => void
  children: ReactNode
  variant?: 'dialog' | 'drawer' | 'command' | 'mobile-drawer'
  labelledBy?: string
  hideDefaultHeader?: boolean
}

export function ModalDialog({ title, onClose, children, variant = 'dialog', labelledBy, hideDefaultHeader = false }: ModalDialogProps) {
  const layerRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const modalIdRef = useRef<number | null>(null)
  const titleId = labelledBy ?? `modal-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useLayoutEffect(() => {
    const layer = layerRef.current
    const dialog = dialogRef.current
    if (!layer || !dialog) return
    const modalId = registerModal(layer, dialog, () => onCloseRef.current())
    modalIdRef.current = modalId
    return () => {
      unregisterModal(modalId)
      modalIdRef.current = null
    }
  }, [])

  const requestClose = () => {
    if (modalIdRef.current !== null) requestModalClose(modalIdRef.current)
  }

  return createPortal(
    <div ref={layerRef} className={`modal-layer ${variant === 'drawer' || variant === 'mobile-drawer' ? 'drawer-layer' : ''}`}>
      <button className="modal-scrim" aria-label={`Close ${title}`} onClick={requestClose} />
      <div
        ref={dialogRef}
        className={`modal-surface modal-${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        {hideDefaultHeader && !labelledBy && <h2 id={titleId} className="sr-only">{title}</h2>}
        {!hideDefaultHeader && <header className="modal-head">
          <h2 id={titleId}>{title}</h2>
          <button className="icon-button" aria-label={`Close ${title}`} onClick={requestClose}><X size={18} /></button>
        </header>}
        {children}
      </div>
    </div>,
    document.body,
  )
}
