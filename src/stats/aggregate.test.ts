import { summarize, wpmSeries, dailyActivity } from './aggregate'
import type { TestResult } from '../store/progress'

function r(partial: Partial<TestResult>): TestResult {
  return {
    at: 0,
    mode: 'time',
    label: 'time:30',
    wpm: 0,
    rawWpm: 0,
    accuracy: 100,
    consistency: 0,
    durationMs: 30000,
    ...partial,
  }
}

describe('summarize', () => {
  it('returns zeros for an empty history', () => {
    expect(summarize([])).toEqual({
      count: 0,
      avgWpm: 0,
      bestWpm: 0,
      avgAccuracy: 0,
    })
  })

  it('computes count, averages and best WPM', () => {
    const s = summarize([
      r({ wpm: 40, accuracy: 90 }),
      r({ wpm: 60, accuracy: 100 }),
    ])
    expect(s).toEqual({ count: 2, avgWpm: 50, bestWpm: 60, avgAccuracy: 95 })
  })
})

describe('wpmSeries', () => {
  it('sorts ascending by time and caps the length', () => {
    const series = wpmSeries(
      [r({ at: 300, wpm: 3 }), r({ at: 100, wpm: 1 }), r({ at: 200, wpm: 2 })],
      2,
    )
    expect(series.map((s) => s.wpm)).toEqual([2, 3])
  })
})

describe('dailyActivity', () => {
  const DAY = 86_400_000

  it('spans the requested window and buckets by day', () => {
    const now = 30 * DAY + 1000
    const cells = dailyActivity(
      [r({ at: now }), r({ at: now }), r({ at: now - 2 * DAY })],
      now,
      7,
    )
    expect(cells).toHaveLength(7)
    expect(cells[cells.length - 1]!.count).toBe(2)
    expect(cells[cells.length - 1]!.level).toBeGreaterThan(0)
    expect(cells[cells.length - 3]!.count).toBe(1)
  })
})
