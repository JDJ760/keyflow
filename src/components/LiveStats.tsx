import type { Session, Stats } from '../engine/types'

/** The headline readout above the words: a countdown / progress figure plus
 * live WPM once typing has begun. */
export function LiveStats({
  session,
  stats,
  remainingMs,
}: {
  session: Session
  stats: Stats
  remainingMs: number | null
}) {
  const { mode, duration } = session.config
  const running = session.status === 'running'

  let headline: string
  if (mode === 'time') {
    const seconds = Math.ceil((remainingMs ?? duration * 1000) / 1000)
    headline = String(seconds)
  } else if (mode === 'words' || mode === 'quote') {
    const done = Math.min(session.typed.length, session.words.length)
    headline = `${done}/${session.words.length}`
  } else {
    headline = `${Math.floor(stats.elapsedMs / 1000)}s`
  }

  return (
    <div className="flex items-baseline gap-4 font-mono text-primary">
      <span className="text-4xl font-bold tabular-nums">{headline}</span>
      <span
        className={`text-sm text-muted transition-opacity ${
          running ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {stats.wpm} wpm
      </span>
    </div>
  )
}
