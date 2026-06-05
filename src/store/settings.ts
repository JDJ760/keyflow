import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TestMode } from '../engine/types'

export type ThemeName =
  | 'liquid'
  | 'aurora'
  | 'pressroom'
  | 'overdrive'
  | 'light'

export const THEME_OPTIONS: { id: ThemeName; label: string }[] = [
  { id: 'liquid', label: 'Liquid Flow' },
  { id: 'aurora', label: 'Aurora Glass' },
  { id: 'pressroom', label: 'Pressroom' },
  { id: 'overdrive', label: 'Overdrive' },
  { id: 'light', label: 'Daylight' },
]

export interface SettingsState {
  mode: TestMode
  duration: number
  wordCount: number
  punctuation: boolean
  numbers: boolean
  theme: ThemeName
  setMode: (mode: TestMode) => void
  setDuration: (duration: number) => void
  setWordCount: (wordCount: number) => void
  togglePunctuation: () => void
  toggleNumbers: () => void
  setTheme: (theme: ThemeName) => void
}

/** User settings, persisted to localStorage (no servers, all local). */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      mode: 'time',
      duration: 30,
      wordCount: 25,
      punctuation: false,
      numbers: false,
      theme: 'liquid',
      setMode: (mode) => set({ mode }),
      setDuration: (duration) => set({ duration }),
      setWordCount: (wordCount) => set({ wordCount }),
      togglePunctuation: () => set((s) => ({ punctuation: !s.punctuation })),
      toggleNumbers: () => set((s) => ({ numbers: !s.numbers })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'keyflow:settings', version: 1 },
  ),
)
