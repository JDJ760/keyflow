import {
  dailySeed,
  levelFromXp,
  levelProgress,
  newAchievements,
  nextStreak,
  xpForLevel,
  xpForTest,
  type AchievementContext,
} from './progression'
import type { Stats, TestConfig } from './types'

const stats = (partial: Partial<Stats>): Stats => ({
  wpm: 60,
  rawWpm: 65,
  accuracy: 100,
  consistency: 70,
  correctChars: 150,
  incorrectChars: 0,
  extraChars: 0,
  missedChars: 0,
  elapsedMs: 30000,
  ...partial,
})

const config: TestConfig = {
  mode: 'time',
  duration: 30,
  wordCount: 25,
  punctuation: false,
  numbers: false,
}

describe('xpForTest', () => {
  it('pays words × 2 at perfect accuracy', () => {
    expect(xpForTest(stats({ correctChars: 150, accuracy: 100 }))).toBe(60)
  })

  it('scales down sharply with poor accuracy', () => {
    expect(xpForTest(stats({ correctChars: 150, accuracy: 50 }))).toBe(15)
  })
})

describe('levels', () => {
  it('starts at level 1 with 0 xp', () => {
    expect(xpForLevel(1)).toBe(0)
    expect(levelFromXp(0)).toBe(1)
  })

  it('levels up exactly at the threshold', () => {
    const threshold = xpForLevel(2)
    expect(levelFromXp(threshold - 1)).toBe(1)
    expect(levelFromXp(threshold)).toBe(2)
  })

  it('reports progress within the current level in [0, 1)', () => {
    const p = levelProgress(xpForLevel(3) + 1)
    expect(p).toBeGreaterThanOrEqual(0)
    expect(p).toBeLessThan(1)
  })
})

describe('nextStreak', () => {
  const fresh = { current: 0, longest: 0, lastDay: null }

  it('starts a streak on the first practice day', () => {
    expect(nextStreak(fresh, '2026-06-11', '2026-06-10')).toEqual({
      current: 1,
      longest: 1,
      lastDay: '2026-06-11',
    })
  })

  it('is a no-op for a second test on the same day', () => {
    const s = { current: 4, longest: 6, lastDay: '2026-06-11' }
    expect(nextStreak(s, '2026-06-11', '2026-06-10')).toBe(s)
  })

  it('increments on consecutive days and tracks the longest', () => {
    const s = { current: 6, longest: 6, lastDay: '2026-06-10' }
    expect(nextStreak(s, '2026-06-11', '2026-06-10')).toEqual({
      current: 7,
      longest: 7,
      lastDay: '2026-06-11',
    })
  })

  it('resets to 1 after a gap but keeps the longest', () => {
    const s = { current: 9, longest: 9, lastDay: '2026-06-01' }
    expect(nextStreak(s, '2026-06-11', '2026-06-10')).toEqual({
      current: 1,
      longest: 9,
      lastDay: '2026-06-11',
    })
  })
})

describe('newAchievements', () => {
  const ctx = (partial: Partial<AchievementContext>): AchievementContext => ({
    stats: stats({}),
    config,
    testsCompleted: 1,
    streak: { current: 1, longest: 1, lastDay: '2026-06-11' },
    isDaily: false,
    isDrill: false,
    ...partial,
  })

  it('awards first test, speed and accuracy badges together', () => {
    const earned = newAchievements([], ctx({}))
    expect(earned).toContain('first-steps')
    expect(earned).toContain('wpm-60')
    expect(earned).toContain('flawless')
  })

  it('never re-awards what is already unlocked', () => {
    expect(
      newAchievements(['first-steps', 'wpm-40', 'wpm-60', 'flawless'], ctx({})),
    ).toEqual([])
  })

  it('does not award speed badges for skewed drill text', () => {
    const earned = newAchievements([], ctx({ isDrill: true }))
    expect(earned).not.toContain('wpm-60')
    expect(earned).toContain('coachable')
  })
})

describe('dailySeed', () => {
  it('is deterministic per day and differs across days', () => {
    expect(dailySeed('2026-06-11')).toBe(dailySeed('2026-06-11'))
    expect(dailySeed('2026-06-11')).not.toBe(dailySeed('2026-06-12'))
  })
})
