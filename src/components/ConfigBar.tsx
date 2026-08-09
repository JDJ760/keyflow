import type { ReactNode } from 'react'
import { useSettings } from '../store/settings'
import type { TestMode } from '../engine/types'

const MODES: { id: TestMode; label: string }[] = [
  { id: 'time', label: 'time' },
  { id: 'words', label: 'words' },
  { id: 'quote', label: 'quote' },
  { id: 'zen', label: 'zen' },
]
const DURATIONS = [15, 30, 60, 120]
const WORD_COUNTS = [10, 25, 50, 100]

export function ConfigBar() {
  const s = useSettings()
  const showModifiers = s.mode !== 'quote'

  return (
    <div className="mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl bg-surface/60 px-3 py-2 text-sm backdrop-blur">
      <Group>
        {MODES.map((m) => (
          <Chip
            key={m.id}
            active={s.mode === m.id}
            onClick={() => s.setMode(m.id)}
          >
            {m.label}
          </Chip>
        ))}
      </Group>

      {s.mode === 'time' && (
        <>
          <Divider />
          <Group>
            {DURATIONS.map((d) => (
              <Chip
                key={d}
                active={s.duration === d}
                onClick={() => s.setDuration(d)}
              >
                {d}
              </Chip>
            ))}
          </Group>
        </>
      )}

      {s.mode === 'words' && (
        <>
          <Divider />
          <Group>
            {WORD_COUNTS.map((n) => (
              <Chip
                key={n}
                active={s.wordCount === n}
                onClick={() => s.setWordCount(n)}
              >
                {n}
              </Chip>
            ))}
          </Group>
        </>
      )}

      {showModifiers && (
        <>
          <Divider />
          <Group>
            <Chip active={s.punctuation} onClick={s.togglePunctuation}>
              ! ?
            </Chip>
            <Chip active={s.numbers} onClick={s.toggleNumbers}>
              123
            </Chip>
          </Group>
        </>
      )}

      <Divider />
      <Group>
        <Chip active={s.dailyChallenge} onClick={s.toggleDaily}>
          ★ daily
        </Chip>
      </Group>
    </div>
  )
}

function Group({ children }: { children: ReactNode }) {
  return <div className="flex items-center gap-1">{children}</div>
}

function Divider() {
  return <span className="h-4 w-px bg-subtle/50" aria-hidden="true" />
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        onClick()
        // Drop focus so the next Space/Enter goes to the test, not this chip.
        e.currentTarget.blur()
      }}
      aria-pressed={active}
      className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
        active ? 'bg-primary text-on-primary' : 'text-muted hover:text-fg'
      }`}
    >
      {children}
    </button>
  )
}
