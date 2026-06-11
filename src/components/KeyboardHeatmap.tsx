import { useMemo } from 'react'
import {
  MIN_SAMPLES,
  weaknessScores,
  type KeyScore,
  type KeyStatsMap,
} from '../engine/adaptive'

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'] as const

/** QWERTY heatmap of weakness scores — redder keys are slower / more error-prone. */
export function KeyboardHeatmap({ keyStats }: { keyStats: KeyStatsMap }) {
  const byChar = useMemo(() => {
    const map = new Map<string, KeyScore>()
    for (const s of weaknessScores(keyStats)) map.set(s.char, s)
    return map
  }, [keyStats])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-col gap-1.5">
        {ROWS.map((row, i) => (
          <div
            key={row}
            className="flex gap-1.5"
            style={{ marginLeft: i * 14 }}
          >
            {[...row].map((ch) => {
              const s = byChar.get(ch)
              const heat = s ? Math.round(s.score * 80) : 0
              const title = s
                ? `${ch} · ${Math.round(s.errorRate * 100)}% errors · ${
                    s.emaMs != null
                      ? `${Math.round(s.emaMs)} ms`
                      : 'no timing yet'
                  } · ${s.samples} presses`
                : `${ch} · needs ${MIN_SAMPLES}+ presses`
              return (
                <span
                  key={ch}
                  title={title}
                  className="flex h-9 w-9 items-center justify-center rounded-lg font-mono text-sm text-fg"
                  style={{
                    backgroundColor: s
                      ? `color-mix(in srgb, var(--error) ${heat}%, var(--surface))`
                      : 'var(--surface)',
                    opacity: s ? 1 : 0.45,
                  }}
                >
                  {ch}
                </span>
              )
            })}
          </div>
        ))}
      </div>
      <p className="text-xs text-subtle">
        redder = weaker (slow or error-prone) · faded keys need more data
      </p>
    </div>
  )
}
