import type { Keystroke } from './types'

/**
 * Per-key analytics: every finished test feeds its keystroke log in here, and
 * the coach uses the accumulated picture to find weak keys and build drills.
 */
export interface KeyStat {
  /** correct presses of this (expected) character */
  hits: number
  /** incorrect presses, attributed to the character that was expected */
  errors: number
  /** exponential moving average of inter-keystroke interval on correct presses */
  emaMs: number | null
}

export type KeyStatsMap = Record<string, KeyStat>

const EMA_ALPHA = 0.15
/** Intervals longer than this are pauses (thinking, tabbing away), not typing. */
const MAX_INTERVAL_MS = 3000
/** A key needs at least this many presses before we judge it. */
export const MIN_SAMPLES = 5

const TRACKED = /^[a-z0-9.,!?;:'-]$/

/** Fold a session's keystrokes into the running per-key stats (immutable). */
export function accumulateKeyStats(
  map: KeyStatsMap,
  keystrokes: Keystroke[],
): KeyStatsMap {
  const next: KeyStatsMap = { ...map }
  for (let i = 0; i < keystrokes.length; i++) {
    const ks = keystrokes[i]!
    const char = ks.expected.toLowerCase()
    if (!TRACKED.test(char)) continue
    const prev = next[char] ?? { hits: 0, errors: 0, emaMs: null }
    const stat: KeyStat = { ...prev }
    if (ks.correct) {
      stat.hits += 1
      // Timing only counts on correct presses; the first keystroke of a
      // session has no interval to measure.
      if (i > 0) {
        const interval = ks.t - keystrokes[i - 1]!.t
        if (interval > 0 && interval <= MAX_INTERVAL_MS) {
          stat.emaMs =
            stat.emaMs == null
              ? interval
              : stat.emaMs + EMA_ALPHA * (interval - stat.emaMs)
        }
      }
    } else {
      stat.errors += 1
    }
    next[char] = stat
  }
  return next
}

export interface KeyScore {
  char: string
  /** 0–1, higher = weaker (slow and/or error-prone) */
  score: number
  /** 0–1 */
  errorRate: number
  emaMs: number | null
  samples: number
}

/**
 * Score every key with enough data. Weakness blends slowness (normalized
 * against your own fastest/slowest keys) with error rate, where a 25%+ error
 * rate counts as maximally bad.
 */
export function weaknessScores(
  map: KeyStatsMap,
  minSamples = MIN_SAMPLES,
): KeyScore[] {
  const eligible = Object.entries(map)
    .map(([char, s]) => ({ char, ...s, samples: s.hits + s.errors }))
    .filter((s) => s.samples >= minSamples)
  if (eligible.length === 0) return []

  const emas = eligible
    .filter((s) => s.emaMs != null)
    .map((s) => s.emaMs as number)
  const minEma = emas.length > 0 ? Math.min(...emas) : 0
  const maxEma = emas.length > 0 ? Math.max(...emas) : 0
  const range = maxEma - minEma

  return eligible
    .map((s) => {
      const slowness =
        s.emaMs != null && range > 0 ? (s.emaMs - minEma) / range : 0
      const errorRate = s.errors / s.samples
      const score = 0.6 * slowness + 0.4 * Math.min(1, errorRate * 4)
      return {
        char: s.char,
        score,
        errorRate,
        emaMs: s.emaMs,
        samples: s.samples,
      }
    })
    .sort((a, b) => b.score - a.score)
}

/** The letters most worth drilling right now (punctuation drills read badly). */
export function pickDrillChars(scores: KeyScore[], n = 4): string[] {
  return scores
    .filter((s) => /^[a-z]$/.test(s.char))
    .slice(0, n)
    .map((s) => s.char)
}
