import { writeFile, mkdir } from 'node:fs/promises'

const endpoint = process.env.CDP_ENDPOINT ?? 'http://localhost:9222'
const app = 'http://127.0.0.1:4173/'
const output = new URL('../docs/design-system/screenshots/', import.meta.url)
await mkdir(output, { recursive: true })

const target = await fetch(`${endpoint}/json/new?${encodeURIComponent(app)}`, { method: 'PUT' }).then(response => response.json())
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let id = 0
const pending = new Map()
const requests = []
const consoleErrors = []
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data)
  if (message.id) {
    const waiter = pending.get(message.id)
    if (!waiter) return
    pending.delete(message.id)
    if (message.error) waiter.reject(new Error(message.error.message))
    else waiter.resolve(message.result)
    return
  }
  if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url)
  if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(message.params.type)) {
    consoleErrors.push(message.params.args.map(argument => argument.value ?? argument.description).join(' '))
  }
  if (message.method === 'Runtime.exceptionThrown') consoleErrors.push(message.params.exceptionDetails.text)
})

function send(method, params = {}) {
  const requestId = ++id
  socket.send(JSON.stringify({ id: requestId, method, params }))
  return new Promise((resolve, reject) => pending.set(requestId, { resolve, reject }))
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
async function navigate() {
  await send('Page.navigate', { url: app })
  await wait(1000)
}
async function viewport(width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width <= 760 })
  await navigate()
}
async function evaluate(expression) {
  return (await send('Runtime.evaluate', { expression, returnByValue: true })).result.value
}
async function inspect() {
  return evaluate(`({
    viewport: [innerWidth, innerHeight],
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    title: document.querySelector('h1')?.textContent,
    active: document.activeElement === document.body ? 'body' : (document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.trim())
  })`)
}
async function screenshot(name) {
  const result = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
  await writeFile(new URL(name, output), Buffer.from(result.data, 'base64'))
}
async function clickByLabel(label) {
  const clicked = await evaluate(`(() => { const node = [...document.querySelectorAll('button')].find(button => button.getAttribute('aria-label') === ${JSON.stringify(label)}); if (!node) return false; node.focus(); node.click(); return true })()`)
  if (!clicked) throw new Error(`Control not found: ${label}`)
  await wait(350)
}
async function clickByText(text) {
  const clicked = await evaluate(`(() => { const node = [...document.querySelectorAll('button')].find(button => button.textContent?.trim() === ${JSON.stringify(text)}); if (!node) return false; node.click(); return true })()`)
  if (!clicked) throw new Error(`Control not found: ${text}`)
  await wait(350)
}
async function key(key, modifiers = 0) {
  const virtualKey = key === 'Tab' ? 9 : key === 'Escape' ? 27 : key.toUpperCase().charCodeAt(0)
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, windowsVirtualKeyCode: virtualKey, modifiers })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: virtualKey, modifiers })
  await wait(50)
}
function assert(condition, message) {
  if (!condition) throw new Error(`browser verification failed: ${message}`)
}

await Promise.all([send('Page.enable'), send('Runtime.enable'), send('Network.enable')])
const views = []
for (const [width, height] of [[320, 900], [760, 1000], [1100, 900], [1440, 1100]]) {
  await viewport(width, height)
  const result = await inspect()
  assert(!result.horizontalOverflow, `${width}px page-level overflow`)
  views.push(result)
  await screenshot(`mission-control-${width}-exact.png`)
}

await viewport(320, 900)
await clickByLabel('Open navigation')
const mobileOpen = await evaluate(`(() => { const dialog=document.querySelector('[role="dialog"]'); return { named: dialog?.getAttribute('aria-labelledby') === 'modal-primary-workspace', focusInside: dialog?.contains(document.activeElement), mainInert: document.querySelector('main')?.inert, topbarInert: document.querySelector('.topbar')?.inert } })()`)
assert(mobileOpen.named && mobileOpen.focusInside && mobileOpen.mainInert && mobileOpen.topbarInert, 'mobile drawer initial focus/background contract')
for (let index = 0; index < 14; index += 1) await key('Tab')
assert(await evaluate(`document.querySelector('[role="dialog"]')?.contains(document.activeElement)`), 'mobile drawer forward Tab containment')
await key('Tab', 8)
assert(await evaluate(`document.querySelector('[role="dialog"]')?.contains(document.activeElement)`), 'mobile drawer reverse Tab containment')
await key('Escape')
await wait(350)
const mobileClosed = await evaluate(`({ dialogOpen: Boolean(document.querySelector('[role="dialog"]')), activeLabel: document.activeElement?.getAttribute('aria-label'), expanded: document.querySelector('.mobile-menu')?.getAttribute('aria-expanded') })`)
assert(!mobileClosed.dialogOpen && mobileClosed.activeLabel === 'Open navigation', `mobile drawer Escape/focus restoration: ${JSON.stringify(mobileClosed)}`)

await viewport(1440, 1100)
const desktopTable = await evaluate(`(() => { const region=document.querySelector('[aria-label="Active work orders table"]'); return { overflow: region.scrollWidth > region.clientWidth, tabIndex: region.getAttribute('tabindex') } })()`)
assert(!desktopTable.overflow && desktopTable.tabIndex === null, `non-overflowing desktop table tab order: ${JSON.stringify(desktopTable)}`)

await viewport(320, 900)
const narrowTable = await evaluate(`(() => { const region=document.querySelector('[aria-label="Active work orders table"]'); return { overflow: region.scrollWidth > region.clientWidth, tabIndex: region.getAttribute('tabindex') } })()`)
assert(narrowTable.overflow && narrowTable.tabIndex === '0', `overflowing narrow table tab order: ${JSON.stringify(narrowTable)}`)
await evaluate(`document.body.focus()`)
let tableReached = false
for (let index = 0; index < 100; index += 1) {
  await key('Tab')
  tableReached = await evaluate(`document.activeElement?.getAttribute('aria-label') === 'Active work orders table'`)
  if (tableReached) break
}
assert(tableReached, 'keyboard reaches named Mission Control table region')

await viewport(1440, 1100)
await clickByText('Assets')
const assetOpened = await evaluate(`(() => { const node=[...document.querySelectorAll('button')].find(button => button.textContent?.includes('2022 Ford F-550')); if (!node) return false; node.click(); return true })()`)
assert(assetOpened, 'asset drawer command-invariant setup')
await wait(350)
await evaluate(`document.querySelector('.global-search')?.click()`)
await key('k', 2)
const commandInvariant = await evaluate(`({ dialogCount: document.querySelectorAll('[role="dialog"]').length, assetOpen: Boolean(document.querySelector('#asset-drawer-title')), commandOpen: Boolean(document.querySelector('#modal-search-and-navigation')) })`)
assert(commandInvariant.dialogCount === 1 && commandInvariant.assetOpen && !commandInvariant.commandOpen, `direct/shortcut command modal invariant: ${JSON.stringify(commandInvariant)}`)

await send('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'forced-colors', value: 'active' }] })
await navigate()
assert(!(await inspect()).horizontalOverflow, 'forced-colors layout overflow')
await screenshot('mission-control-forced-colors.png')
await send('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'forced-colors', value: 'none' }] })

const reflow = []
for (const [label, width] of [['200%', 720], ['400%', 360]]) {
  await viewport(width, 900)
  const result = await inspect()
  reflow.push({ label, equivalentCssViewport: width, ...result })
  assert(!result.horizontalOverflow, `${label} equivalent narrow-viewport reflow`)
}

await viewport(1440, 1100)
await clickByLabel('Open design system lab')
views.push(await inspect())
await screenshot('design-system-lab-1440.png')
await navigate()
await clickByText('Investigate with agent')
views.push(await inspect())
await screenshot('investigation-1440.png')
await wait(1500)

const externalRequests = [...new Set(requests.filter(url => {
  try { return new URL(url).origin !== new URL(app).origin && !url.startsWith('data:') }
  catch { return true }
}))]
const report = {
  browser: target.Browser,
  app,
  views,
  reflow,
  keyboard: { mobileDrawer: mobileOpen, desktopTable, narrowTable, missionControlTableReached: tableReached, commandInvariant },
  forcedColors: { emulated: true, screenshot: 'mission-control-forced-colors.png' },
  requests: [...new Set(requests)],
  externalRequests,
  consoleErrors,
}
assert(externalRequests.length === 0, 'external network requests observed')
assert(consoleErrors.length === 0, 'console warning/error/exception observed')
await writeFile(new URL('../browser-verification.json', output), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ views, reflow, keyboard: report.keyboard, forcedColors: report.forcedColors, externalRequests, consoleErrors, requestCount: report.requests.length }, null, 2))
socket.close()
await fetch(`${endpoint}/json/close/${target.id}`)
