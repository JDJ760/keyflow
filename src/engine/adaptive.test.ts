import {
  accumulateKeyStats,
  pickDrillChars,
  weaknessScores,
  type KeyStatsMap,
} from './adaptive'
import type { Keystroke } from './types'

const ks = (t: number, expected: string, correct: boolean): Keystroke => ({
  t,
  expected,
  typed: correct ? expected : 'x',
  correct,
})

describe('accumulateKeyStats', () => {
  it('counts hits and attributes errors to the expected character', () => {
    const map = accumulateKeyStats({}, [
      ks(0, 'a', true),
      ks(100, 'b', false),
      ks(200, 'b', true),
    ])
    expect(map['a']).toMatchObject({ hits: 1, errors: 0 })
    expect(map['b']).toMatchObject({ hits: 1, errors: 1 })
  })

  it('tracks an interval EMA only for correct presses after the first', () => {
    const map = accumulateKeyStats({}, [ks(0, 'a', true), ks(150, 'b', true)])
    expect(map['a']!.emaMs).toBeNull() // first keystroke has no interval
    expect(map['b']!.emaMs).toBe(150)
  })

  it('ignores long pauses when measuring speed', () => {
    const map = accumulateKeyStats({}, [ks(0, 'a', true), ks(10000, 'b', true)])
    expect(map['b']!.emaMs).toBeNull()
  })

  it('normalizes to lowercase and skips untracked characters', () => {
    const map = accumulateKeyStats({}, [
      ks(0, 'T', true),
      ks(100, ' ', true),
      ks(200, '', false),
    ])
    expect(Object.keys(map)).toEqual(['t'])
  })

  it('does not mutate the input map', () => {
    const original: KeyStatsMap = { a: { hits: 1, errors: 0, emaMs: 100 } }
    accumulateKeyStats(original, [ks(0, 'a', true)])
    expect(original['a']).toEqual({ hits: 1, errors: 0, emaMs: 100 })
  })
})

describe('weaknessScores', () => {
  const stat = (hits: number, errors: number, emaMs: number | null) => ({
    hits,
    errors,
    emaMs,
  })

  it('filters out keys with too few samples', () => {
    expect(weaknessScores({ a: stat(2, 0, 100) })).toEqual([])
  })

  it('ranks slow, error-prone keys as weakest and fast, clean keys last', () => {
    const map: KeyStatsMap = {
      f: stat(20, 0, 120), // fast and clean
      q: stat(10, 8, 380), // slow and error-prone
      j: stat(20, 1, 200), // middling
    }
    const scores = weaknessScores(map)
    expect(scores[0]!.char).toBe('q')
    expect(scores[scores.length - 1]!.char).toBe('f')
  })

  it('still scores on errors when timing is uniform', () => {
    const map: KeyStatsMap = {
      a: stat(10, 0, 150),
      b: stat(5, 5, 150),
    }
    const scores = weaknessScores(map)
    expect(scores[0]!.char).toBe('b')
    expect(scores[0]!.score).toBeGreaterThan(0)
  })
})

describe('pickDrillChars', () => {
  it('returns only letters, capped at n, weakest first', () => {
    const scores = weaknessScores({
      ',': { hits: 5, errors: 5, emaMs: 400 },
      z: { hits: 5, errors: 4, emaMs: 380 },
      k: { hits: 6, errors: 3, emaMs: 300 },
      a: { hits: 20, errors: 0, emaMs: 100 },
    })
    const chars = pickDrillChars(scores, 2)
    expect(chars).toHaveLength(2)
    for (const c of chars) expect(/^[a-z]$/.test(c)).toBe(true)
    expect(chars[0]).toBe('z')
  })
})
