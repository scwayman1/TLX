let nextModalId = 0
const modalStack: number[] = []

export function registerModal() {
  const id = ++nextModalId
  modalStack.push(id)
  return id
}

export function unregisterModal(id: number) {
  const index = modalStack.lastIndexOf(id)
  if (index >= 0) modalStack.splice(index, 1)
}

export function isTopModal(id: number) {
  return modalStack.at(-1) === id
}

export function isModalActive() {
  return modalStack.length > 0
}
