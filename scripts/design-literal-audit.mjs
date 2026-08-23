import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const root = 'src'
const threshold = 0
const authoredExtensions = new Set(['.css', '.ts', '.tsx', '.js', '.mjs'])
const generatedByProvenance = new Set([
  'src/design-system/tokens.css',
  'src/design-system/tokens.generated.ts',
])
const nonRuntimeAuthored = /(?:^|\/)(?:[^/]+\.test\.[^.]+|test-setup\.ts)$/
const findings = []

const normalized = path => path.replaceAll('\\', '/')
const manifestSource = await readFile('src/design-system/tokens.generated.ts', 'utf8')
const manifestMatch = manifestSource.match(/export const designTokens = ([\s\S]+) as const\s*$/)
if (!manifestMatch) throw new Error('Generated token manifest provenance could not be read')
const designTokens = JSON.parse(manifestMatch[1])

const valueOwners = new Map()
for (const [role, contract] of Object.entries(designTokens.typography)) {
  for (const [property, rawValue] of Object.entries(contract)) {
    const value = String(rawValue).toLowerCase().replace(/^(-?)0\./, '$1.')
    const key = `${property}:${value}`
    valueOwners.set(key, [...(valueOwners.get(key) ?? []), role])
  }
}
valueOwners.set(`textTransform:${designTokens.contracts.typography['label-text-transform']}`, ['label'])
valueOwners.set(`fontVariant:${designTokens.contracts.typography['numeric-font-variant']}`, ['numeric'])

const cssPropertyToManifest = new Map([
  ['font-size', 'fontSize'],
  ['font-weight', 'fontWeight'],
  ['line-height', 'lineHeight'],
  ['letter-spacing', 'letterSpacing'],
  ['font-feature-settings', 'fontFeature'],
  ['font-variant-numeric', 'fontVariant'],
  ['text-transform', 'textTransform'],
])

function hasRawColor(line, extension) {
  if (/#[0-9a-f]{3,8}\b/i.test(line) || /\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\s*\(/i.test(line)) return true
  if (extension === '.css') return /\b(?:color|background(?:-color)?|border(?:-[a-z]+)?-color|fill|stroke)\s*:\s*(?:white|black)\b/i.test(line)
  return /\b(?:color|backgroundColor|borderColor|fill|stroke)\s*:\s*['"](?:white|black|red|green|blue|transparent)['"]/i.test(line)
}

function typographyFinding(line) {
  const declaration = line.match(/\b(font-size|font-weight|line-height|letter-spacing|font-feature-settings|font-variant-numeric|text-transform)\s*:\s*([^;}]+)/i)
  if (!declaration || declaration[2].includes('var(')) return null
  const cssProperty = declaration[1].toLowerCase()
  const manifestProperty = cssPropertyToManifest.get(cssProperty)
  const value = declaration[2].trim().toLowerCase().replace(/^(-?)0\./, '$1.')
  const owners = valueOwners.get(`${manifestProperty}:${value}`)
  if (!owners || owners.length !== 1) return null
  return `duplicated normative typography ${cssProperty}: ${declaration[2].trim()} (${owners[0]})`
}

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      await walk(path)
      continue
    }
    const extension = extname(path)
    const repositoryPath = normalized(relative('.', path))
    if (!authoredExtensions.has(extension) || generatedByProvenance.has(repositoryPath) || nonRuntimeAuthored.test(repositoryPath)) continue

    const lines = (await readFile(path, 'utf8')).split(/\r?\n/)
    lines.forEach((line, index) => {
      const exception = `${lines[index - 1] ?? ''} ${line}`.includes('design-audit-allow local-geometry:')
      if (hasRawColor(line, extension)) findings.push(`${repositoryPath}:${index + 1}: raw color literal`)
      if (extension === '.css' && !exception) {
        const typography = typographyFinding(line)
        if (typography) findings.push(`${repositoryPath}:${index + 1}: ${typography}`)
      }
    })
  }
}

await walk(root)
const scope = 'all authored src CSS and runtime TS/TSX/JS/MJS; generated token artifacts and non-runtime tests/setup excluded by explicit provenance'
if (findings.length) {
  console.error(findings.join('\n'))
  console.error(`design literal audit: ${findings.length} violations (threshold: ${threshold}; scope: ${scope})`)
  process.exitCode = 1
} else {
  console.log(`design literal audit: 0 violations (threshold: ${threshold}; scope: ${scope})`)
}
