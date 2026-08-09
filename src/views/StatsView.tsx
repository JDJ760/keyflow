import type { ReactNode } from 'react'
import { useProgress } from '../store/progress'
import { ACHIEVEMENTS } from '../engine/progression'
import { summarize } from '../stats/aggregate'
import { WpmHistoryChart } from '../components/WpmHistoryChart'
import { PracticeCalendar } from '../components/PracticeCalendar'
import { DataControls } from '../components/DataControls'

export function StatsView() {
  const history = useProgress((s) => s.history)
  const unlocked = useProgress((s) => s.achievements)
  const summary = summarize(history)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-8">
      {history.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="font-mono text-xl text-fg">no tests yet</p>
          <p className="max-w-sm text-sm text-muted">
            Head to the test and finish a run — your WPM trend, streak calendar,
            and bests will appear here.
          </p>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="tests" value={summary.count} />
            <Stat label="avg wpm" value={summary.avgWpm} accent />
            <Stat label="best wpm" value={summary.bestWpm} accent />
            <Stat label="avg acc" value={`${summary.avgAccuracy}%`} />
          </section>

          <Panel title="WPM over time">
            <WpmHistoryChart history={history} />
          </Panel>

          <Panel title="practice">
            <PracticeCalendar history={history} />
          </Panel>
        </>
      )}

      <Panel title={`achievements · ${unlocked.length}/${ACHIEVEMENTS.length}`}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {ACHIEVEMENTS.map((a) => {
            const got = unlocked.includes(a.id)
            return (
              <li
                key={a.id}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                  got ? 'bg-overlay/50' : 'opacity-45'
                }`}
              >
                <span aria-hidden="true">{got ? '🏆' : '🔒'}</span>
                <span>
                  <span className="block text-sm font-semibold text-fg">
                    {a.name}
                  </span>
                  <span className="block text-xs text-muted">
                    {a.description}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      </Panel>

      <Panel title="your data">
        <DataControls />
      </Panel>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-surface/50 p-5 backdrop-blur">
      <h2 className="mb-4 text-xs font-semibold tracking-widest text-muted uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: ReactNode
  accent?: boolean
}) {
  return (
    <div className="rounded-2xl bg-surface/50 p-4 backdrop-blur">
      <div
        className={`font-mono text-3xl font-bold tabular-nums ${
          accent ? 'text-primary' : 'text-fg'
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-xs tracking-wider text-muted uppercase">
        {label}
      </div>
    </div>
  )
}
