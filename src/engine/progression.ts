import type { Stats, TestConfig } from './types'

/**
 * Progression math: XP, levels, daily streaks, and achievements. Pure
 * functions only — the store applies them when a test finishes.
 */

/** XP for one finished test: words typed, scaled by accuracy (squared so
 * sloppy speed doesn't pay). A clean 30s @ 60 WPM run earns ~60 XP. */
export function xpForTest(stats: Stats): number {
  const words = stats.correctChars / 5
  const accFactor = (stats.accuracy / 100) ** 2
  return Math.max(0, Math.round(words * 2 * accFactor))
}

/** Total XP required to *reach* a level (level 1 = 0 XP). */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.round(100 * (level - 1) ** 1.5)
}

export function levelFromXp(xp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  return level
}

/** Progress through the current level, 0–1, for the level bar. */
export function levelProgress(xp: number): number {
  const level = levelFromXp(xp)
  const floor = xpForLevel(level)
  const ceil = xpForLevel(level + 1)
  return ceil > floor ? (xp - floor) / (ceil - floor) : 0
}

export interface Streak {
  current: number
  longest: number
  /** local-date key (YYYY-MM-DD) of the last practice day */
  lastDay: string | null
}

/** Advance the streak for a test finished on `todayKey`. */
export function nextStreak(
  streak: Streak,
  todayKey: string,
  yesterdayKey: string,
): Streak {
  if (streak.lastDay === todayKey) return streak
  const current = streak.lastDay === yesterdayKey ? streak.current + 1 : 1
  return {
    current,
    longest: Math.max(streak.longest, current),
    lastDay: todayKey,
  }
}

export interface AchievementContext {
  stats: Stats
  config: TestConfig
  testsCompleted: number
  streak: Streak
  isDaily: boolean
  isDrill: boolean
}

export interface Achievement {
  id: string
  name: string
  description: string
  earned: (ctx: AchievementContext) => boolean
}

const nonDrill = (ctx: AchievementContext) => !ctx.isDrill

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Finish your first test',
    earned: (ctx) => ctx.testsCompleted >= 1,
  },
  {
    id: 'regular',
    name: 'Regular',
    description: 'Finish 10 tests',
    earned: (ctx) => ctx.testsCompleted >= 10,
  },
  {
    id: 'century',
    name: 'Century Club',
    description: 'Finish 100 tests',
    earned: (ctx) => ctx.testsCompleted >= 100,
  },
  {
    id: 'wpm-40',
    name: 'Cruising',
    description: 'Reach 40 WPM',
    earned: (ctx) => nonDrill(ctx) && ctx.stats.wpm >= 40,
  },
  {
    id: 'wpm-60',
    name: 'Swift',
    description: 'Reach 60 WPM',
    earned: (ctx) => nonDrill(ctx) && ctx.stats.wpm >= 60,
  },
  {
    id: 'wpm-80',
    name: 'Rapid',
    description: 'Reach 80 WPM',
    earned: (ctx) => nonDrill(ctx) && ctx.stats.wpm >= 80,
  },
  {
    id: 'wpm-100',
    name: 'Lightning',
    description: 'Reach 100 WPM',
    earned: (ctx) => nonDrill(ctx) && ctx.stats.wpm >= 100,
  },
  {
    id: 'flawless',
    name: 'Flawless',
    description: '100% accuracy over 50+ keystrokes',
    earned: (ctx) =>
      ctx.stats.accuracy === 100 &&
      ctx.stats.correctChars + ctx.stats.incorrectChars >= 50,
  },
  {
    id: 'streak-3',
    name: 'Warming Up',
    description: 'Practice 3 days in a row',
    earned: (ctx) => ctx.streak.current >= 3,
  },
  {
    id: 'streak-7',
    name: 'On Fire',
    description: 'Practice 7 days in a row',
    earned: (ctx) => ctx.streak.current >= 7,
  },
  {
    id: 'streak-30',
    name: 'Unstoppable',
    description: 'Practice 30 days in a row',
    earned: (ctx) => ctx.streak.current >= 30,
  },
  {
    id: 'coachable',
    name: 'Coachable',
    description: 'Finish a targeted drill',
    earned: (ctx) => ctx.isDrill,
  },
  {
    id: 'daily-driver',
    name: 'Daily Driver',
    description: 'Finish a daily challenge',
    earned: (ctx) => ctx.isDaily,
  },
]

/** IDs newly earned by this test (excluding already-unlocked ones). */
export function newAchievements(
  unlocked: string[],
  ctx: AchievementContext,
): string[] {
  const have = new Set(unlocked)
  return ACHIEVEMENTS.filter((a) => !have.has(a.id) && a.earned(ctx)).map(
    (a) => a.id,
  )
}

/** Stable seed for a local date so everyone (and every retry) gets the same
 * daily-challenge text on a given day. */
export function dailySeed(dateKey: string): number {
  let h = 2166136261
  for (const ch of dateKey) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
