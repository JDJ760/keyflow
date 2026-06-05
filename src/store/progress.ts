import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Stats, TestConfig } from '../engine/types'

export interface Best {
  wpm: number
  accuracy: number
  at: number
}

export interface ProgressState {
  bests: Record<string, Best>
  testsCompleted: number
  lastResult: { isBest: boolean; wpm: number } | null
  recordResult: (config: TestConfig, stats: Stats) => { isBest: boolean }
}

/** A stable key per test variant, so personal bests are compared like-for-like. */
export function bestKey(config: TestConfig): string {
  if (config.mode === 'time') return `time:${config.duration}`
  if (config.mode === 'words') return `words:${config.wordCount}`
  return config.mode
}

/** Personal bests + lifetime counters, persisted locally. */
export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      bests: {},
      testsCompleted: 0,
      lastResult: null,
      recordResult: (config, stats) => {
        const key = bestKey(config)
        const previous = get().bests[key]
        const isBest = !previous || stats.wpm > previous.wpm
        set((state) => ({
          testsCompleted: state.testsCompleted + 1,
          lastResult: { isBest, wpm: stats.wpm },
          bests: isBest
            ? {
                ...state.bests,
                [key]: {
                  wpm: stats.wpm,
                  accuracy: stats.accuracy,
                  at: Date.now(),
                },
              }
            : state.bests,
        }))
        return { isBest }
      },
    }),
    { name: 'keyflow:progress', version: 1 },
  ),
)
