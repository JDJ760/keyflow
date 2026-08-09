import { useEffect, useMemo, useRef } from 'react'
import { useSettings } from '../store/settings'
import { useProgress } from '../store/progress'
import { useCoach } from '../store/coach'
import { dailySeed } from '../engine/progression'
import { dateKey } from '../stats/aggregate'

// Day-resolution timestamp captured at load (keeps Date.now out of render).
const TODAY_KEY = dateKey(Date.now())
import { useTypingEngine } from '../hooks/useTypingEngine'
import type { Session, Stats, TestConfig } from '../engine/types'
import { ConfigBar } from '../components/ConfigBar'
import { TypingArea } from '../components/TypingArea'
import { LiveStats } from '../components/LiveStats'
import { FlowGauge } from '../components/FlowGauge'
import { ResultCard } from '../components/ResultCard'

export function TypingView() {
  const { mode, duration, wordCount, punctuation, numbers } = useSettings()
  const dailyChallenge = useSettings((s) => s.dailyChallenge)
  const toggleDaily = useSettings((s) => s.toggleDaily)
  const activeDrill = useCoach((s) => s.activeDrill)
  const setActiveDrill = useCoach((s) => s.setActiveDrill)
  const config: TestConfig = useMemo(() => {
    // An active drill takes over: short words-mode test of weak-key text.
    if (activeDrill && activeDrill.length > 0) {
      return {
        mode: 'words',
        duration,
        wordCount: 25,
        punctuation: false,
        numbers: false,
        drillChars: activeDrill,
      }
    }
    // The daily challenge: same seeded 50 words for everyone, every retry.
    if (dailyChallenge) {
      return {
        mode: 'words',
        duration,
        wordCount: 50,
        punctuation: false,
        numbers: false,
        seed: dailySeed(TODAY_KEY),
      }
    }
    return { mode, duration, wordCount, punctuation, numbers }
  }, [
    mode,
    duration,
    wordCount,
    punctuation,
    numbers,
    activeDrill,
    dailyChallenge,
  ])

  const { session, stats, remainingMs, restart } = useTypingEngine(config)
  const recordResult = useProgress((s) => s.recordResult)
  const lastResult = useProgress((s) => s.lastResult)
  const ingest = useCoach((s) => s.ingest)

  // Record each finished test exactly once (keyed by session identity). Writing
  // to the external store is a legitimate effect — no React state is set here.
  const recordedSession = useRef<Session | null>(null)
  useEffect(() => {
    if (session.status === 'finished' && recordedSession.current !== session) {
      recordedSession.current = session
      recordResult(session.config, stats)
      // Feed the coach's per-key analytics with this session's keystrokes.
      ingest(session.keystrokes)
    }
  }, [session, stats, recordResult, ingest])

  const finished = session.status === 'finished'

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6">
      <div className="pt-4">
        {config.drillChars ? (
          <div className="mx-auto flex w-fit items-center gap-3 rounded-2xl bg-surface/60 px-4 py-2 text-sm backdrop-blur">
            <span className="text-muted">drill</span>
            <span className="font-mono font-semibold tracking-[0.3em] text-primary">
              {config.drillChars.join(' ')}
            </span>
            <button
              type="button"
              onClick={(e) => {
                setActiveDrill(null)
                e.currentTarget.blur()
              }}
              className="text-muted transition-colors hover:text-fg"
            >
              ✕ exit
            </button>
          </div>
        ) : dailyChallenge ? (
          <div className="mx-auto flex w-fit items-center gap-3 rounded-2xl bg-surface/60 px-4 py-2 text-sm backdrop-blur">
            <span className="text-muted">★ daily challenge</span>
            <span className="font-mono font-semibold text-primary">
              {TODAY_KEY}
            </span>
            <button
              type="button"
              onClick={(e) => {
                toggleDaily()
                e.currentTarget.blur()
              }}
              className="text-muted transition-colors hover:text-fg"
            >
              ✕ exit
            </button>
          </div>
        ) : (
          <ConfigBar />
        )}
      </div>

      {finished ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <ResultCard stats={stats} result={lastResult} onRestart={restart} />
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
            onClick={(e) => {
              restart()
              e.currentTarget.blur()
            }}
            className="text-sm text-subtle transition-colors hover:text-muted"
          >
            {config.mode === 'zen'
              ? 'esc to finish · tab to restart'
              : '↻ restart · tab'}
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
