import { useEffect, useMemo, useRef } from 'react'
import { useSettings } from '../store/settings'
import { useProgress } from '../store/progress'
import { useTypingEngine } from '../hooks/useTypingEngine'
import type { Session, Stats, TestConfig } from '../engine/types'
import { ConfigBar } from '../components/ConfigBar'
import { TypingArea } from '../components/TypingArea'
import { LiveStats } from '../components/LiveStats'
import { FlowGauge } from '../components/FlowGauge'
import { ResultCard } from '../components/ResultCard'

export function TypingView() {
  const { mode, duration, wordCount, punctuation, numbers } = useSettings()
  const config: TestConfig = useMemo(
    () => ({ mode, duration, wordCount, punctuation, numbers }),
    [mode, duration, wordCount, punctuation, numbers],
  )

  const { session, stats, remainingMs, restart } = useTypingEngine(config)
  const recordResult = useProgress((s) => s.recordResult)
  const lastResult = useProgress((s) => s.lastResult)

  // Record each finished test exactly once (keyed by session identity). Writing
  // to the external store is a legitimate effect — no React state is set here.
  const recordedSession = useRef<Session | null>(null)
  useEffect(() => {
    if (session.status === 'finished' && recordedSession.current !== session) {
      recordedSession.current = session
      recordResult(session.config, stats)
    }
  }, [session, stats, recordResult])

  const finished = session.status === 'finished'

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6">
      <div className="pt-4">
        <ConfigBar />
      </div>

      {finished ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <ResultCard
            stats={stats}
            isBest={lastResult?.isBest ?? false}
            onRestart={restart}
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-9 py-8">
          <LiveStats
            session={session}
            stats={stats}
            remainingMs={remainingMs}
          />
          <div className="flex w-full items-stretch gap-6">
            <div className="min-w-0 flex-1">
              <TypingArea session={session} />
            </div>
            <FlowGauge progress={computeProgress(session, stats)} />
          </div>
          <button
            type="button"
            onClick={restart}
            className="text-sm text-subtle transition-colors hover:text-muted"
          >
            ↻ restart · tab
          </button>
        </div>
      )}
    </div>
  )
}

function computeProgress(session: Session, stats: Stats): number {
  const c = session.config
  if (c.mode === 'time') {
    return c.duration > 0
      ? Math.min(1, stats.elapsedMs / (c.duration * 1000))
      : 0
  }
  if (c.mode === 'words' || c.mode === 'quote') {
    const total = session.words.length
    return total > 0
      ? Math.min(1, Math.min(session.typed.length, total) / total)
      : 0
  }
  return 0
}
