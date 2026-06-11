import { useMemo, type ReactNode } from 'react'
import { useCoach } from '../store/coach'
import { MIN_SAMPLES, pickDrillChars, weaknessScores } from '../engine/adaptive'
import { KeyboardHeatmap } from '../components/KeyboardHeatmap'

export function CoachView({ gotoTest }: { gotoTest: () => void }) {
  const keyStats = useCoach((s) => s.keyStats)
  const setActiveDrill = useCoach((s) => s.setActiveDrill)
  const scores = useMemo(() => weaknessScores(keyStats), [keyStats])
  const drillChars = useMemo(() => pickDrillChars(scores, 4), [scores])

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-8">
      <Panel title="keyboard heatmap">
        <KeyboardHeatmap keyStats={keyStats} />
      </Panel>

      {scores.length === 0 ? (
        <Panel title="weakest keys">
          <p className="text-sm text-muted">
            Finish a few tests first — once a key has {MIN_SAMPLES}+ presses, it
            shows up here with speed and accuracy details, and the coach builds
            drills for your weakest letters.
          </p>
        </Panel>
      ) : (
        <>
          <Panel title="weakest keys">
            <ul className="grid gap-2 sm:grid-cols-2">
              {scores.slice(0, 6).map((s) => (
                <li
                  key={s.char}
                  className="flex items-center gap-3 rounded-xl bg-overlay/50 px-3 py-2"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface font-mono text-lg font-bold text-primary">
                    {s.char}
                  </span>
                  <span className="text-sm text-muted">
                    {Math.round(s.errorRate * 100)}% errors
                    {s.emaMs != null
                      ? ` · ${Math.round(s.emaMs)} ms/key`
                      : ''}{' '}
                    · {s.samples} presses
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          {drillChars.length > 0 && (
            <Panel title="targeted drill">
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-sm text-muted">
                  Practice text weighted toward your weakest letters:
                </p>
                <span className="font-mono text-lg font-bold tracking-[0.35em] text-primary">
                  {drillChars.join(' ')}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    setActiveDrill(drillChars)
                    e.currentTarget.blur()
                    gotoTest()
                  }}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition-transform hover:scale-[1.03]"
                >
                  start drill
                </button>
              </div>
            </Panel>
          )}
        </>
      )}
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
