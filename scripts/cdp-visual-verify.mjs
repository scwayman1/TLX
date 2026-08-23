import { writeFile, mkdir } from 'node:fs/promises'

const endpoint = 'http://localhost:9222'
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
const events = []
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
  events.push(message)
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
  await wait(500)
}
async function viewport(width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width <= 760 })
  await navigate()
}
async function inspect() {
  return (await send('Runtime.evaluate', {
    expression: `({
      viewport: [innerWidth, innerHeight],
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      title: document.querySelector('h1')?.textContent,
      active: document.activeElement === document.body ? 'body' : (document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.trim())
    })`,
    returnByValue: true,
  })).result.value
}
async function screenshot(name) {
  const result = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
  await writeFile(new URL(name, output), Buffer.from(result.data, 'base64'))
}
async function clickByLabel(label) {
  const expression = `(() => { const node = [...document.querySelectorAll('button')].find(button => button.getAttribute('aria-label') === ${JSON.stringify(label)}); if (!node) return false; node.click(); return true })()`
  const clicked = (await send('Runtime.evaluate', { expression, returnByValue: true })).result.value
  if (!clicked) throw new Error(`Control not found: ${label}`)
  await wait(250)
}
async function clickByText(text) {
  const expression = `(() => { const node = [...document.querySelectorAll('button')].find(button => button.textContent?.trim() === ${JSON.stringify(text)}); if (!node) return false; node.click(); return true })()`
  const clicked = (await send('Runtime.evaluate', { expression, returnByValue: true })).result.value
  if (!clicked) throw new Error(`Control not found: ${text}`)
  await wait(250)
}

await Promise.all([send('Page.enable'), send('Runtime.enable'), send('Network.enable')])
const views = []
for (const [width, height] of [[320, 900], [760, 1000], [1100, 900], [1440, 1100]]) {
  await viewport(width, height)
  views.push(await inspect())
  await screenshot(`mission-control-${width}-exact.png`)
}
await viewport(1440, 1100)
await clickByLabel('Open design system lab')
views.push(await inspect())
await screenshot('design-system-lab-1440.png')
await navigate()
await clickByText('Investigate with agent')
views.push(await inspect())
await screenshot('investigation-1440.png')

const externalRequests = [...new Set(requests.filter(url => {
  try { return new URL(url).origin !== new URL(app).origin && !url.startsWith('data:') }
  catch { return true }
}))]
const report = {
  browser: target.Browser,
  app,
  views,
  requests: [...new Set(requests)],
  externalRequests,
  consoleErrors,
}
await writeFile(new URL('../browser-verification.json', output), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ views, externalRequests, consoleErrors, requestCount: report.requests.length }, null, 2))
socket.close()
await fetch(`${endpoint}/json/close/${target.id}`)
