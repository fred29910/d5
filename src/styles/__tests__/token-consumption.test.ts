/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const indexCss = readFileSync(resolve(root, 'src/index.css'), 'utf8')
const sharedCss = readFileSync(resolve(root, 'src/styles/shared.css'), 'utf8')
const homeSrc = readFileSync(resolve(root, 'src/routes/pages/Home.tsx'), 'utf8')

const TOKENS = [
  'var(--radius-card)',
  'var(--radius-button)',
  'var(--radius-input)',
  'var(--color-brand-500)',
  'var(--shadow-card)',
  'var(--font-body)',
  'var(--bg)',
  'var(--border)',
]

describe('token consumption (S1)', () => {
  it('shared.css defines @utility btn-primary/card/input consuming real tokens', () => {
    expect(sharedCss).toContain('@utility btn-primary')
    expect(sharedCss).toContain('@utility card')
    expect(sharedCss).toContain('@utility input')
    for (const t of TOKENS) expect(sharedCss).toContain(t)
  })

  it('index.css wires shared.css and defines every consumed token', () => {
    expect(indexCss).toContain('@import "./styles/shared.css"')
    for (const t of TOKENS) {
      const name = t.slice(4, -1)
      expect(indexCss).toContain(`${name}:`)
    }
  })

  it('btn-primary is used by a real page (content-scanned into build)', () => {
    expect(homeSrc).toContain('btn-primary')
  })
})
