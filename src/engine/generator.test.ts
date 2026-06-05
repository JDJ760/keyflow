import { generateWords, textForConfig } from './generator'
import { mulberry32 } from './rng'
import type { TestConfig } from './types'

describe('generateWords', () => {
  it('generates the requested number of words from the pool', () => {
    const pool = ['alpha', 'bravo', 'charlie']
    const words = generateWords(10, {}, mulberry32(1), pool)
    expect(words).toHaveLength(10)
    for (const w of words) expect(pool).toContain(w)
  })

  it('is deterministic for a given seed', () => {
    expect(generateWords(8, {}, mulberry32(42))).toEqual(
      generateWords(8, {}, mulberry32(42)),
    )
  })

  it('injects numbers when enabled', () => {
    const words = generateWords(5, { numbers: true }, () => 0)
    expect(words.every((w) => /^\d+$/.test(w))).toBe(true)
  })

  it('can append punctuation when enabled', () => {
    const words = generateWords(200, { punctuation: true }, mulberry32(5))
    expect(words.some((w) => /[.,!?;:']$/.test(w))).toBe(true)
  })
})

describe('textForConfig', () => {
  const base: TestConfig = {
    mode: 'words',
    duration: 30,
    wordCount: 25,
    punctuation: false,
    numbers: false,
  }

  it('returns exactly wordCount words in words mode', () => {
    expect(textForConfig(base, mulberry32(3)).words).toHaveLength(25)
  })

  it('returns a quote with a source in quote mode', () => {
    const out = textForConfig({ ...base, mode: 'quote' }, mulberry32(3))
    expect(out.words.length).toBeGreaterThan(0)
    expect(out.quoteSource).toBeTruthy()
  })

  it('returns a generous buffer in time mode', () => {
    const out = textForConfig({ ...base, mode: 'time' }, mulberry32(3))
    expect(out.words.length).toBeGreaterThanOrEqual(80)
  })
})
