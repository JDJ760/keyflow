import type { TestResult } from '../store/progress'

const DAY_MS = 86_400_000

export interface Summary {
  count: number
  avgWpm: number
  bestWpm: number
  avgAccuracy: number
}

export function summarize(history: TestResult[]): Summary {
  if (history.length === 0) {
    return { count: 0, avgWpm: 0, bestWpm: 0, avgAccuracy: 0 }
  }
  let sumWpm = 0
  let sumAcc = 0
  let best = 0
  for (const r of history) {
    sumWpm += r.wpm
    sumAcc += r.accuracy
    if (r.wpm > best) best = r.wpm
  }
  return {
    count: history.length,
    avgWpm: Math.round(sumWpm / history.length),
    bestWpm: best,
    avgAccuracy: Math.round(sumAcc / history.length),
  }
}

/** Most recent `max` results, oldest → newest, for trend charts. */
export function wpmSeries(
  history: TestResult[],
  max = 60,
): { wpm: number; at: number }[] {
  return [...history]
    .sort((a, b) => a.at - b.at)
    .slice(-max)
    .map((r) => ({ wpm: r.wpm, at: r.at }))
}

/** Local-time YYYY-MM-DD key for a timestamp. */
export function dateKey(ts: number): string {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export type ActivityLevel = 0 | 1 | 2 | 3 | 4

export interface DayCell {
  key: string
  count: number
  level: ActivityLevel
}

function levelFor(count: number): ActivityLevel {
  if (count === 0) return 0
  if (count < 3) return 1
  if (count < 6) return 2
  if (count < 10) return 3
  return 4
}

/** One cell per day for the last `days` days (ending today), for the heatmap. */
export function dailyActivity(
  history: TestResult[],
  now: number,
  days = 119,
): DayCell[] {
  const counts = new Map<string, number>()
  for (const r of history) {
    const k = dateKey(r.at)
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  const cells: DayCell[] = []
  const startMs = now - (days - 1) * DAY_MS
  for (let i = 0; i < days; i++) {
    const key = dateKey(startMs + i * DAY_MS)
    const count = counts.get(key) ?? 0
    cells.push({ key, count, level: levelFor(count) })
  }
  return cells
}
