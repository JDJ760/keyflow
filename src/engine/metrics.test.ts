import { charCounts, computeConsistency, computeStats } from './metrics'
import type { Keystroke, Session } from './types'

function session(partial: Partial<Session>): Session {
  return {
    config: {
      mode: 'words',
      duration: 30,
      wordCount: 10,
      punctuation: false,
      numbers: false,
    },
    words: [],
    status: 'finished',
    typed: [],
    startedAt: 0,
    finishedAt: 60000,
    keystrokes: [],
    ...partial,
  }
}

describe('charCounts', () => {
  it('counts correct letters plus the spaces between completed words', () => {
    const c = charCounts(
      session({ words: ['the', 'cat'], typed: ['the', 'cat'] }),
    )
    expect(c).toEqual({ correct: 7, incorrect: 0, extra: 0, missed: 0 })
  })

  it('flags incorrect characters', () => {
    const c = charCounts(session({ words: ['cat'], typed: ['cot'] }))
    expect(c.correct).toBe(2)
    expect(c.incorrect).toBe(1)
  })

  it('counts extra characters past the word length', () => {
    expect(charCounts(session({ words: ['hi'], typed: ['hiya'] })).extra).toBe(
      2,
    )
  })

  it('counts missed letters for completed words', () => {
    const c = charCounts(
      session({ words: ['hello', 'world'], typed: ['hel', 'world'] }),
    )
    expect(c.missed).toBe(2)
  })

  it('does not count missed letters for the word still being typed', () => {
    const c = charCounts(
      session({
        words: ['hello', 'world'],
        typed: ['hello', 'wo'],
        status: 'running',
      }),
    )
    expect(c.missed).toBe(0)
  })
})

describe('computeStats', () => {
  it('computes WPM from correct characters over elapsed minutes', () => {
    const words = Array<string>(10).fill('aaaa') // 40 letters + 9 spaces = 49 correct
    const stats = computeStats(
      session({ words, typed: words, startedAt: 0, finishedAt: 60000 }),
      60000,
    )
    expect(stats.correctChars).toBe(49)
    expect(stats.wpm).toBe(10)
  })

  it('reports 100% accuracy with no keystrokes yet', () => {
    expect(computeStats(session({}), 0).accuracy).toBe(100)
  })

  it('computes accuracy from the keystroke log', () => {
    const keystrokes: Keystroke[] = [
      { t: 0, expected: 'a', typed: 'x', correct: false },
      { t: 100, expected: 'a', typed: 'a', correct: true },
      { t: 200, expected: 'b', typed: 'b', correct: true },
    ]
    expect(computeStats(session({ keystrokes }), 60000).accuracy).toBe(67)
  })
})

describe('computeConsistency', () => {
  it('is 100 for perfectly even keystroke timing', () => {
    const keystrokes: Keystroke[] = Array.from({ length: 6 }, (_, i) => ({
      t: i * 100,
      expected: 'a',
      typed: 'a',
      correct: true,
    }))
    expect(computeConsistency(keystrokes)).toBe(100)
  })

  it('is 0 with too few samples', () => {
    expect(computeConsistency([])).toBe(0)
  })
})
