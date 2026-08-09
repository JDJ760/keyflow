import type { ReactNode } from 'react'
import type { Stats } from '../engine/types'
import type { LastResult } from '../store/progress'
import { ACHIEVEMENTS } from '../engine/progression'

/** End-of-test summary: headline WPM + accuracy, supporting metrics, rewards
 * (xp, level-ups, achievements), and a personal-best flag. */
export function ResultCard({
  stats,
  result,
  onRestart,
}: {
  stats: Stats
  result: LastResult | null
  onRestart: () => void
}) {
  const earnedNames = (result?.newAchievements ?? [])
    .map((id) => ACHIEVEMENTS.find((a) => a.id === id)?.name)
    .filter(Boolean)

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-7 rounded-3xl bg-surface/50 px-8 py-10 backdrop-blur">
      {(result?.isBest || result?.leveledUp || (result?.xpGained ?? 0) > 0) && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {result?.isBest && (
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
              ★ new personal best
            </span>
          )}
          {(result?.xpGained ?? 0) > 0 && (
            <span className="rounded-full bg-correct/10 px-3 py-1 text-xs font-semibold tracking-wide text-correct uppercase">
              +{result?.xpGained} xp
            </span>
          )}
          {result?.leveledUp && (
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
              ⬆ level up
            </span>
          )}
        </div>
      )}

      {earnedNames.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {earnedNames.map((name) => (
            <span
              key={name}
              className="rounded-full bg-overlay/70 px-3 py-1 text-xs font-semibold text-fg"
            >
              🏆 {name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-end gap-10">
        <BigStat label="wpm" value={stats.wpm} accent />
        <BigStat label="accuracy" value={`${stats.accuracy}%`} />
      </div>

      <div className="grid w-full grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
        <SmallStat label="raw" value={stats.rawWpm} />
        <SmallStat label="consistency" value={`${stats.consistency}%`} />
        <SmallStat
          label="time"
          value={`${(stats.elapsedMs / 1000).toFixed(1)}s`}
        />
        <SmallStat
          label="chars"
          value={`${stats.correctChars}/${stats.incorrectChars}/${stats.extraChars}/${stats.missedChars}`}
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            onRestart()
            e.currentTarget.blur()
          }}
          className="rounded-xl bg-primary px-5 py-2 font-semibold text-on-primary transition-transform hover:scale-[1.03]"
        >
          retry
        </button>
        <p className="text-xs text-subtle">tab or enter to retry</p>
      </div>
    </div>
  )
}

function BigStat({
  label,
  value,
  accent,
}: {
  label: string
  value: ReactNode
  accent?: boolean
}) {
  return (
    <div className="flex flex-col">
      <span
        className={`font-mono text-6xl leading-none font-bold tabular-nums ${
          accent ? 'text-primary' : 'text-fg'
        }`}
      >
        {value}
      </span>
      <span className="mt-2 text-xs tracking-widest text-muted uppercase">
        {label}
      </span>
    </div>
  )
}

function SmallStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-xl font-semibold text-fg tabular-nums">
        {value}
      </span>
      <span className="mt-1 text-[0.7rem] tracking-wider text-muted uppercase">
        {label}
      </span>
    </div>
  )
}
