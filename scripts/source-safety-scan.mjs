import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const roots = ['src', 'docs', 'scripts']
const extensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.css', '.md', '.json', '.html'])
const patterns = new Map([
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['AWS access key', /AKIA[0-9A-Z]{16}/],
  ['GitHub token', /gh[pousr]_[A-Za-z0-9_]{20,}/],
  ['OpenAI-style key', /sk-[A-Za-z0-9]{20,}/],
])
const allowedTargets = new Set([
  'https://www.designtokens.org/schemas/2025.10/format.json',
  'http://127.0.0.1:4173/',
  'http://localhost:9222',
])
const hits = []

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await walk(path)
    else if (extensions.has(extname(path))) {
      let text = await readFile(path, 'utf8')
      for (const target of allowedTargets) text = text.replaceAll(target, '')
      for (const [name, pattern] of patterns) if (pattern.test(text)) hits.push(`${relative('.', path)}: ${name}`)
      if (/^(src|scripts)[\\/]/.test(path) && /https?:\/\//.test(text)) hits.push(`${relative('.', path)}: unapproved external runtime target`)
    }
  }
}
for (const root of roots) await walk(root)
if (hits.length) {
  console.error(hits.join('\n'))
  process.exitCode = 1
} else {
  console.log('source safety scan: no high-confidence secrets or unapproved application runtime targets')
}
