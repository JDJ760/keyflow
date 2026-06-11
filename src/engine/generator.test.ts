import { generateDrillWords, generateWords, textForConfig } from './generator'
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

describe('generateDrillWords', () => {
  it('is deterministic for a seed and returns the requested count', () => {
    const a = generateDrillWords(12, ['e', 'r'], mulberry32(7))
    expect(a).toHaveLength(12)
    expect(a).toEqual(generateDrillWords(12, ['e', 'r'], mulberry32(7)))
  })

  it('emphasizes the target characters', () => {
    const words = generateDrillWords(40, ['e'], mulberry32(9))
    const withTarget = words.filter((w) => w.includes('e')).length
    expect(withTarget / words.length).toBeGreaterThan(0.7)
  })

  it('synthesizes practice words for letters the pool barely covers', () => {
    const words = generateDrillWords(10, ['z'], mulberry32(3))
    expect(words).toHaveLength(10)
    expect(words.every((w) => w.includes('z'))).toBe(true)
  })

  it('falls back to normal words when no target chars are given', () => {
    expect(generateDrillWords(5, [], mulberry32(1))).toHaveLength(5)
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
