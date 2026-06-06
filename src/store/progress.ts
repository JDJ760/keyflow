import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Stats, TestConfig, TestMode } from '../engine/types'

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

export interface ProgressState {
  bests: Record<string, Best>
  testsCompleted: number
  lastResult: { isBest: boolean; wpm: number } | null
  history: TestResult[]
  recordResult: (config: TestConfig, stats: Stats) => { isBest: boolean }
  clearAll: () => void
}

/** A stable key per test variant, so personal bests are compared like-for-like. */
export function bestKey(config: TestConfig): string {
  if (config.mode === 'time') return `time:${config.duration}`
  if (config.mode === 'words') return `words:${config.wordCount}`
  return config.mode
}

const MAX_HISTORY = 500

/** Personal bests, lifetime counters, and per-test history — persisted locally. */
export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      bests: {},
      testsCompleted: 0,
      lastResult: null,
      history: [],
      recordResult: (config, stats) => {
        const key = bestKey(config)
        const previous = get().bests[key]
        const isBest = !previous || stats.wpm > previous.wpm
        const at = Date.now()
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
          testsCompleted: state.testsCompleted + 1,
          lastResult: { isBest, wpm: stats.wpm },
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
        set({ bests: {}, testsCompleted: 0, lastResult: null, history: [] }),
    }),
    { name: 'keyflow:progress', version: 1 },
  ),
)
