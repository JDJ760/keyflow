import { useMemo } from 'react'
import type { TestResult } from '../store/progress'
import { wpmSeries } from '../stats/aggregate'

/** Hand-rolled SVG sparkline of WPM over your recent tests (no chart library). */
export function WpmHistoryChart({ history }: { history: TestResult[] }) {
  const series = useMemo(() => wpmSeries(history, 60), [history])

  if (series.length < 2) {
    return (
      <p className="text-sm text-muted">
        Finish a couple of tests and your WPM trend shows up here.
      </p>
    )
  }

  const w = 720
  const h = 200
  const pad = 26
  const vals = series.map((s) => s.wpm)
  const max = Math.max(...vals)
  const min = Math.min(...vals)
  const range = Math.max(1, max - min)

  const points = series.map((s, i) => {
    const x = pad + (i / (series.length - 1)) * (w - 2 * pad)
    const y = h - pad - ((s.wpm - min) / range) * (h - 2 * pad)
    return [x, y] as const
  })
  const line = points
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`
  const last = points[points.length - 1]!

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full"
      role="img"
      aria-label="WPM over your recent tests"
    >
      <polyline points={area} fill="var(--color-primary)" opacity="0.12" />
      <polyline
        points={line}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={last[0]} cy={last[1]} r="4" fill="var(--color-primary)" />
      <text x={pad} y={pad - 10} fill="var(--color-muted)" fontSize="12">
        {max} wpm
      </text>
      <text x={pad} y={h - pad + 18} fill="var(--color-muted)" fontSize="12">
        {min} wpm
      </text>
    </svg>
  )
}
