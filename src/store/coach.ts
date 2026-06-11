import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Keystroke } from '../engine/types'
import { accumulateKeyStats, type KeyStatsMap } from '../engine/adaptive'

export interface CoachState {
  keyStats: KeyStatsMap
  /** when set, the test view runs drills weighted toward these characters */
  activeDrill: string[] | null
  ingest: (keystrokes: Keystroke[]) => void
  setActiveDrill: (chars: string[] | null) => void
  clearStats: () => void
}

/** Per-key analytics feeding the coach — persisted locally like everything else. */
export const useCoach = create<CoachState>()(
  persist(
    (set) => ({
      keyStats: {},
      activeDrill: null,
      ingest: (keystrokes) =>
        set((s) => ({ keyStats: accumulateKeyStats(s.keyStats, keystrokes) })),
      setActiveDrill: (chars) => set({ activeDrill: chars }),
      clearStats: () => set({ keyStats: {}, activeDrill: null }),
    }),
    {
      name: 'keyflow:coach',
      version: 1,
      // Persist only the stats — an active drill shouldn't survive a reload.
      partialize: (s) => ({ keyStats: s.keyStats }),
    },
  ),
)
