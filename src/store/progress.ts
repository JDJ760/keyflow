import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Stats, TestConfig, TestMode } from '../engine/types'
import {
  levelFromXp,
  newAchievements,
  nextStreak,
  xpForTest,
  type Streak,
} from '../engine/progression'
import { dateKey } from '../stats/aggregate'

export interface Best {
  wpm: number
  accuracy: number
  at: number
}

export interface TestResult {
  at: number
  mode: TestMode
  label: string
  wpm: number
  rawWpm: number
  accuracy: number
  consistency: number
  durationMs: number
}

export interface LastResult {
  isBest: boolean
  wpm: number
  xpGained: number
  leveledUp: boolean
  newAchievements: string[]
}

export interface ProgressState {
  bests: Record<string, Best>
  testsCompleted: number
  lastResult: LastResult | null
  history: TestResult[]
  xp: number
  streak: Streak
  achievements: string[]
  recordResult: (config: TestConfig, stats: Stats) => { isBest: boolean }
  clearAll: () => void
}

/** A stable key per test variant, so personal bests are compared like-for-like. */
export function bestKey(config: TestConfig): string {
  // Drill and daily text are skewed/seeded — keep them out of the normal bests.
  if (config.drillChars && config.drillChars.length > 0) return 'drill'
  if (config.seed != null) return 'daily'
  if (config.mode === 'time') return `time:${config.duration}`
  if (config.mode === 'words') return `words:${config.wordCount}`
  return config.mode
}

const MAX_HISTORY = 500
const DAY_MS = 86_400_000

/** Personal bests, history, XP/streak/achievements — persisted locally. */
export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      bests: {},
      testsCompleted: 0,
      lastResult: null,
      history: [],
      xp: 0,
      streak: { current: 0, longest: 0, lastDay: null },
      achievements: [],
      recordResult: (config, stats) => {
        const key = bestKey(config)
        const prev = get()
        const previousBest = prev.bests[key]
        const isBest = !previousBest || stats.wpm > previousBest.wpm
        const at = Date.now()

        const xpGained = xpForTest(stats)
        const xp = prev.xp + xpGained
        const leveledUp = levelFromXp(xp) > levelFromXp(prev.xp)
        const streak = nextStreak(
          prev.streak,
          dateKey(at),
          dateKey(at - DAY_MS),
        )
        const testsCompleted = prev.testsCompleted + 1
        const earned = newAchievements(prev.achievements, {
          stats,
          config,
          testsCompleted,
          streak,
          isDaily: config.seed != null,
          isDrill: (config.drillChars?.length ?? 0) > 0,
        })

        const result: TestResult = {
          at,
          mode: config.mode,
          label: key,
          wpm: stats.wpm,
          rawWpm: stats.rawWpm,
          accuracy: stats.accuracy,
          consistency: stats.consistency,
          durationMs: stats.elapsedMs,
        }
        set((state) => ({
          testsCompleted,
          xp,
          streak,
          achievements: [...state.achievements, ...earned],
          lastResult: {
            isBest,
            wpm: stats.wpm,
            xpGained,
            leveledUp,
            newAchievements: earned,
          },
          history: [...state.history, result].slice(-MAX_HISTORY),
          bests: isBest
            ? {
                ...state.bests,
                [key]: { wpm: stats.wpm, accuracy: stats.accuracy, at },
              }
            : state.bests,
        }))
        return { isBest }
      },
      clearAll: () =>
        set({
          bests: {},
          testsCompleted: 0,
          lastResult: null,
          history: [],
          xp: 0,
          streak: { current: 0, longest: 0, lastDay: null },
          achievements: [],
        }),
    }),
    { name: 'keyflow:progress', version: 1 },
  ),
)
