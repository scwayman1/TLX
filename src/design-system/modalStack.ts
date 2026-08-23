type ModalRegistration = {
  id: number
  layer: HTMLElement
  dialog: HTMLElement
  onClose: () => void
  opener: HTMLElement | null
}

type BackgroundState = {
  inert: boolean
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

let nextModalId = 0
const modalStack: ModalRegistration[] = []
let backgroundState: Map<HTMLElement, BackgroundState> | null = null
let rootOpener: HTMLElement | null = null

function focusableWithin(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
}

function focusInto(registration: ModalRegistration, preferred?: HTMLElement | null) {
  if (preferred?.isConnected && registration.dialog.contains(preferred)) {
    preferred.focus()
    if (document.activeElement === preferred) return
  }
  const target = focusableWithin(registration.dialog)[0] ?? registration.dialog
  target.focus()
}

function syncLayers() {
  const top = modalStack.at(-1)
  for (const registration of modalStack) {
    const isTop = registration === top
    registration.layer.inert = !isTop
    if (isTop) registration.layer.removeAttribute('aria-hidden')
    else registration.layer.setAttribute('aria-hidden', 'true')
  }
}

function ownBackground() {
  const background = Array.from(document.querySelectorAll<HTMLElement>('[data-modal-background]'))
  backgroundState = new Map(background.map(element => [element, { inert: element.inert }]))
  rootOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  background.forEach(element => { element.inert = true })
  window.addEventListener('keydown', handleKeyDown)
}

function releaseBackground() {
  if (backgroundState) {
    for (const [element, state] of backgroundState) {
      if (element.isConnected) element.inert = state.inert
    }
  }
  backgroundState = null
  window.removeEventListener('keydown', handleKeyDown)
  const restoreTarget = rootOpener
  rootOpener = null
  if (restoreTarget?.isConnected) restoreTarget.focus()
}

function handleKeyDown(event: KeyboardEvent) {
  const top = modalStack.at(-1)
  if (!top) return
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    top.onClose()
    return
  }
  if (event.key !== 'Tab') return

  const focusable = focusableWithin(top.dialog)
  if (!focusable.length) {
    event.preventDefault()
    top.dialog.focus()
    return
  }
  const first = focusable[0]
  const last = focusable.at(-1)!
  const active = document.activeElement
  if (!top.dialog.contains(active)) {
    event.preventDefault()
    ;(event.shiftKey ? last : first).focus()
  } else if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

export function registerModal(layer: HTMLElement, dialog: HTMLElement, onClose: () => void) {
  if (!modalStack.length) ownBackground()
  const registration: ModalRegistration = {
    id: ++nextModalId,
    layer,
    dialog,
    onClose,
    opener: document.activeElement instanceof HTMLElement ? document.activeElement : null,
  }
  modalStack.push(registration)
  syncLayers()
  focusInto(registration)
  return registration.id
}

export function unregisterModal(id: number) {
  const index = modalStack.findIndex(registration => registration.id === id)
  if (index < 0) return
  const wasTop = index === modalStack.length - 1
  const [removed] = modalStack.splice(index, 1)
  removed.layer.inert = false
  removed.layer.removeAttribute('aria-hidden')

  if (!modalStack.length) {
    releaseBackground()
    return
  }

  syncLayers()
  if (wasTop) focusInto(modalStack.at(-1)!, removed.opener)
}

export function requestModalClose(id: number) {
  const top = modalStack.at(-1)
  if (top?.id === id) top.onClose()
}

export function isTopModal(id: number) {
  return modalStack.at(-1)?.id === id
}

export function isModalActive() {
  return modalStack.length > 0
}

export function getModalManagerSnapshot() {
  return {
    depth: modalStack.length,
    topId: modalStack.at(-1)?.id ?? null,
    backgroundOwned: backgroundState !== null,
  }
}

export function resetModalManagerForTests() {
  for (const registration of modalStack) {
    registration.layer.inert = false
    registration.layer.removeAttribute('aria-hidden')
  }
  modalStack.splice(0)
  releaseBackground()
  nextModalId = 0
}
