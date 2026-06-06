import { useMemo } from 'react'
import type { TestResult } from '../store/progress'
import { dailyActivity, type DayCell } from '../stats/aggregate'

const LEVEL_OPACITY = [0.06, 0.3, 0.5, 0.75, 1] as const

// Captured once at module load — day resolution, so this is plenty accurate and
// keeps Date.now() out of render (where it would be an impure call).
const TODAY = Date.now()

/** GitHub-style practice heatmap: one square per day for the last ~17 weeks. */
export function PracticeCalendar({ history }: { history: TestResult[] }) {
  const weeks = useMemo(() => {
    const cells = dailyActivity(history, TODAY, 17 * 7)
    const first = cells[0]!.key.split('-').map(Number)
    const firstDow = new Date(first[0]!, first[1]! - 1, first[2]!).getDay()
    const padded: (DayCell | null)[] = [
      ...Array<null>(firstDow).fill(null),
      ...cells,
    ]
    const cols: (DayCell | null)[][] = []
    for (let i = 0; i < padded.length; i += 7) cols.push(padded.slice(i, i + 7))
    return cols
  }, [history])

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {weeks.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-1">
          {col.map((cell, ri) =>
            cell ? (
              <span
                key={ri}
                title={`${cell.key} · ${cell.count} test${cell.count === 1 ? '' : 's'}`}
                className="h-3 w-3 rounded-[3px]"
                style={{
                  backgroundColor: 'var(--color-primary)',
                  opacity: LEVEL_OPACITY[cell.level] ?? 1,
                }}
              />
            ) : (
              <span key={ri} className="h-3 w-3" />
            ),
          )}
        </div>
      ))}
    </div>
  )
}
