import { readFile, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const check = process.argv.includes('--check')
const root = resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
const designPath = resolve(root, 'DESIGN.md')
const source = await readFile(designPath, 'utf8')
const frontMatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]
if (!frontMatter) throw new Error('DESIGN.md YAML front matter was not found')

function parseScalar(raw) {
  const value = raw.trim()
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) return value.slice(1, -1)
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value)
  if (value === 'true' || value === 'false') return value === 'true'
  return value
}

function parseFrontMatter(text) {
  const result = {}
  const stack = [{ indent: -1, value: result }]
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue
    const match = line.match(/^(\s*)([^:]+):(?:\s*(.*))?$/)
    if (!match) continue
    const indent = match[1].length
    const key = match[2].trim()
    const raw = match[3] ?? ''
    while (stack.at(-1).indent >= indent) stack.pop()
    const parent = stack.at(-1).value
    if (raw === '') {
      parent[key] = {}
      stack.push({ indent, value: parent[key] })
    } else parent[key] = parseScalar(raw)
  }
  return result
}

const tokens = parseFrontMatter(frontMatter)
const contractSource = source.match(/```telemetryx-contracts\r?\n([\s\S]*?)\r?\n```/)?.[1]
if (!contractSource) throw new Error('DESIGN.md telemetryx-contracts block was not found')
const contracts = JSON.parse(contractSource)
const runtimeTokens = { ...tokens, contracts }
const at = path => path.split('.').reduce((value, key) => value?.[key], runtimeTokens)
const requireToken = path => {
  const value = at(path)
  if (value === undefined) throw new Error(`Required DESIGN.md token missing: ${path}`)
  return value
}
const fontStack = value => String(value).split(',').map(part => {
  const name = part.trim()
  return ['system-ui', 'sans-serif', 'monospace'].includes(name) ? name : `"${name}"`
}).join(', ')

const cssEntries = [
  ['brand-ink','colors.brand-ink'], ['brand-forest','colors.brand-forest'], ['brand-operational','colors.primary'],
  ['brand-operational-hover','colors.primary-hover'], ['brand-operational-soft','colors.primary-soft'], ['brand-on-primary','colors.on-primary'],
  ['brand-lime-signal','colors.brand-lime-signal'], ['color-canvas','colors.canvas'], ['color-surface','colors.surface'],
  ['color-surface-subtle','colors.surface-subtle'], ['color-surface-strong','colors.surface-strong'], ['color-text','colors.text'],
  ['color-text-muted','colors.text-muted'], ['color-text-subtle','colors.text-subtle'], ['color-border','colors.border'],
  ['color-border-strong','colors.border-strong'], ['color-focus','colors.focus'], ['color-success','colors.success'],
  ['color-success-soft','colors.success-soft'], ['color-success-on-soft','colors.on-success-soft'], ['color-warning','colors.warning'],
  ['color-warning-soft','colors.warning-soft'], ['color-warning-on-soft','colors.on-warning-soft'], ['color-danger','colors.danger'],
  ['color-danger-soft','colors.danger-soft'], ['color-danger-on-soft','colors.on-danger-soft'], ['color-info','colors.info'],
  ['color-info-soft','colors.info-soft'], ['color-info-on-soft','colors.on-info-soft'], ['color-disabled','colors.disabled'],
  ['color-disabled-text','colors.on-disabled'], ['color-overlay','colors.overlay'],
  ['text-display','typography.display.fontSize'], ['weight-display','typography.display.fontWeight'], ['leading-display','typography.display.lineHeight'], ['tracking-display','typography.display.letterSpacing'],
  ['text-heading-lg','typography.heading-lg.fontSize'], ['weight-heading-lg','typography.heading-lg.fontWeight'], ['leading-heading-lg','typography.heading-lg.lineHeight'], ['tracking-heading-lg','typography.heading-lg.letterSpacing'],
  ['text-heading-md','typography.heading-md.fontSize'], ['weight-heading-md','typography.heading-md.fontWeight'], ['leading-heading-md','typography.heading-md.lineHeight'],
  ['text-body','typography.body.fontSize'], ['weight-body','typography.body.fontWeight'], ['leading-body','typography.body.lineHeight'],
  ['text-body-sm','typography.body-sm.fontSize'], ['weight-body-sm','typography.body-sm.fontWeight'], ['leading-body-sm','typography.body-sm.lineHeight'],
  ['text-label','typography.label.fontSize'], ['weight-label','typography.label.fontWeight'], ['leading-label','typography.label.lineHeight'], ['tracking-label','typography.label.letterSpacing'], ['transform-label','contracts.typography.label-text-transform'],
  ['text-numeric','typography.numeric.fontSize'], ['weight-numeric','typography.numeric.fontWeight'], ['leading-numeric','typography.numeric.lineHeight'], ['tracking-numeric','typography.numeric.letterSpacing'], ['feature-numeric','typography.numeric.fontFeature'], ['variant-numeric','contracts.typography.numeric-font-variant'],
  ['text-code','typography.code.fontSize'], ['weight-code','typography.code.fontWeight'], ['leading-code','typography.code.lineHeight'],
  ...Object.keys(tokens.spacing).map(key => [`space-${key}`, `spacing.${key}`]),
  ['radius-0','rounded.none'], ['radius-xs','rounded.xs'], ['radius-sm','rounded.sm'], ['radius-md','rounded.md'], ['radius-lg','rounded.lg'], ['radius-full','rounded.full'],
  ['control-height','components.compact-control.height'], ['control-height-touch','components.mobile-control.height'],
  ['sidebar-width','components.layout-sidebar.width'], ['topbar-height','components.layout-topbar.height'], ['content-max','components.layout-content.width'],
  ['shadow-1','contracts.elevation.level-1'], ['shadow-2','contracts.elevation.level-2'], ['shadow-3','contracts.elevation.level-3'],
  ['duration-fast','contracts.motion.duration-fast'], ['duration-spatial','contracts.motion.duration-spatial'], ['ease-out','contracts.motion.ease-out'],
]

const css = `/* GENERATED by scripts/generate-design-tokens.mjs from DESIGN.md. DO NOT EDIT. */\n:root {\n  color-scheme: light;\n  --ds-font-sans: ${fontStack(requireToken('typography.body.fontFamily'))};\n  --ds-font-mono: ${fontStack(requireToken('typography.code.fontFamily'))};\n${cssEntries.map(([name, path]) => `  --ds-${name}: ${requireToken(path)};`).join('\n')}\n  --ds-border-width: 1px; /* documented rendering geometry, not a semantic token */\n  --ink: var(--ds-color-text);\n  --muted: var(--ds-color-text-muted);\n  --line: var(--ds-color-border);\n  --green: var(--ds-brand-operational);\n  --lime: var(--ds-brand-lime-signal);\n  --panel: var(--ds-color-surface);\n  --soft: var(--ds-color-surface-subtle);\n}\n`
const manifest = `/* GENERATED by scripts/generate-design-tokens.mjs from DESIGN.md. DO NOT EDIT. */\nexport const designTokens = ${JSON.stringify(runtimeTokens, null, 2)} as const\n`

const cli = resolve(root, 'node_modules/@google/design.md/dist/index.js')
function exported(format) {
  const result = spawnSync(process.execPath, [cli, 'export', '--format', format, designPath], { encoding: 'utf8', cwd: root })
  if (result.status !== 0) throw new Error(result.stderr || `design.md ${format} export failed`)
  if (!result.stdout.trim()) throw new Error(`design.md ${format} export returned empty output`)
  return result.stdout.endsWith('\n') ? result.stdout : `${result.stdout}\n`
}
const outputs = new Map([
  [resolve(root, 'design-tokens/tokens.json'), `${JSON.stringify((() => { const dtcg = JSON.parse(exported('dtcg')); dtcg.$extensions = { ...(dtcg.$extensions ?? {}), telemetryx: contracts }; return dtcg })(), null, 2)}\n`],
  [resolve(root, 'design-tokens/tailwind-v4.css'), exported('css-tailwind')],
  [resolve(root, 'src/design-system/tokens.css'), css],
  [resolve(root, 'src/design-system/tokens.generated.ts'), manifest],
])

let drift = false
for (const [path, content] of outputs) {
  if (check) {
    const existing = await readFile(path, 'utf8').catch(() => '')
    if (existing !== content) {
      console.error(`design token drift: ${path.slice(root.length + 1)}`)
      drift = true
    }
  } else await writeFile(path, content)
}
if (drift) process.exitCode = 1
else console.log(check ? 'design token drift check: clean' : `design generation: wrote ${outputs.size} deterministic artifacts`)
