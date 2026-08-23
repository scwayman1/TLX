import { describe, expect, it } from 'vitest'

// Platform safety contract: the bounded demo must run with no external
// runtime requests and no wall-clock/random identity in the decision flow.

const sources = import.meta.glob('./**/*.{ts,tsx,css}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

describe('platform safety contract', () => {
  it('references no external network origin from any source or style file', () => {
    const entries = Object.entries(sources).filter(([path]) => !/\.test\.(ts|tsx)$/.test(path))
    expect(entries.length).toBeGreaterThan(5)
    for (const [path, content] of entries) {
      expect(content, `${path} must not reference an external origin`).not.toMatch(/https?:\/\//)
    }
  })

  it('uses no wall-clock or random identity in the bounded domain flow', () => {
    for (const module of ['./domain/demo-fixture.ts', './domain/investigation.ts', './domain/decision-plan.ts']) {
      const content = sources[module]
      expect(content, `${module} must be part of the scanned sources`).toBeTruthy()
      expect(content, `${module} must not use Date.now`).not.toMatch(/Date\.now/)
      expect(content, `${module} must not use Math.random`).not.toMatch(/Math\.random/)
      expect(content, `${module} must not construct wall-clock dates`).not.toMatch(/new Date\(\)/)
      expect(content, `${module} must not use locale-dependent rendering`).not.toMatch(/toLocaleString/)
    }
  })
})
