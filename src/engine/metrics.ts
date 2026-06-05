import type { Keystroke, Session, Stats } from './types'

export interface CharCounts {
  correct: number
  incorrect: number
  extra: number
  missed: number
}

/**
 * Compare what the user typed against the target, word by word. Spaces between
 * completed words count as correct characters (they advance the test).
 */
export function charCounts(session: Session): CharCounts {
  let correct = 0
  let incorrect = 0
  let extra = 0
  let missed = 0

  const n = session.typed.length
  for (let i = 0; i < n; i++) {
    const target = session.words[i] ?? ''
    const typed = session.typed[i] ?? ''
    const isCurrentWord = i === n - 1 && session.status === 'running'

    for (let j = 0; j < typed.length; j++) {
      if (j < target.length) {
        if (typed[j] === target[j]) correct++
        else incorrect++
      } else {
        extra++
      }
    }

    // Unfinished letters only count as "missed" once we've moved past the word.
    if (!isCurrentWord && typed.length < target.length) {
      missed += target.length - typed.length
    }

    // The space separating this word from the next was typed correctly.
    if (i < n - 1) correct++
  }

  return { correct, incorrect, extra, missed }
}

/** Consistency = how even your keystroke timing is (100 = perfectly metronomic). */
export function computeConsistency(keystrokes: Keystroke[]): number {
  if (keystrokes.length < 3) return 0
  const intervals: number[] = []
  for (let i = 1; i < keystrokes.length; i++) {
    intervals.push(keystrokes[i]!.t - keystrokes[i - 1]!.t)
  }
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length
  if (mean <= 0) return 0
  const variance =
    intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length
  const cv = Math.sqrt(variance) / mean
  return clampPct(Math.round((1 - cv) * 100))
}

export function computeStats(session: Session, now: number): Stats {
  const { startedAt } = session
  const end =
    session.finishedAt ?? (session.status === 'running' ? now : startedAt)
  const elapsedMs =
    startedAt != null && end != null ? Math.max(0, end - startedAt) : 0
  const minutes = elapsedMs / 60000

  const { correct, incorrect, extra, missed } = charCounts(session)
  const totalTyped = correct + incorrect + extra

  const wpm = minutes > 0 ? Math.round(correct / 5 / minutes) : 0
  const rawWpm = minutes > 0 ? Math.round(totalTyped / 5 / minutes) : 0

  const ks = session.keystrokes
  const correctKs = ks.reduce((acc, k) => acc + (k.correct ? 1 : 0), 0)
  const accuracy =
    ks.length > 0 ? Math.round((correctKs / ks.length) * 100) : 100

  return {
    wpm,
    rawWpm,
    accuracy,
    consistency: computeConsistency(ks),
    correctChars: correct,
    incorrectChars: incorrect,
    extraChars: extra,
    missedChars: missed,
    elapsedMs,
  }
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, n))
}
