import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const root = 'src'
const generated = new Set(['src\\design-system\\tokens.css', 'src/design-system/tokens.css'])
const findings = []

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await walk(path)
    else if (extname(path) === '.css' && !generated.has(path)) {
      const text = await readFile(path, 'utf8')
      text.split(/\r?\n/).forEach((line, index) => {
        if (/#[0-9a-f]{3,8}\b/i.test(line) || /\brgba?\s*\(/i.test(line) || /\b(?:color|background(?:-color)?):\s*(?:white|black)\b/i.test(line)) {
          findings.push(`${relative('.', path)}:${index + 1}: raw color literal`)
        }
      })
    }
  }
}
await walk(root)
if (findings.length) {
  console.error(findings.join('\n'))
  console.error(`design literal audit: ${findings.length} violations (threshold: 0 outside generated tokens.css)`)
  process.exitCode = 1
} else console.log('design literal audit: 0 raw color violations (threshold: 0 outside generated tokens.css)')
