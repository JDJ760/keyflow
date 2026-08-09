import { useEffect, useState, type ReactNode } from 'react'
import { useSettings } from './store/settings'
import { useProgress } from './store/progress'
import { levelFromXp, levelProgress } from './engine/progression'
import { LiquidBackground } from './components/LiquidBackground'
import { TypingView } from './views/TypingView'
import { StatsView } from './views/StatsView'
import { CoachView } from './views/CoachView'
import { ThemePicker } from './components/ThemePicker'

type View = 'test' | 'stats' | 'coach'

export default function App() {
  const theme = useSettings((s) => s.theme)
  const [view, setView] = useState<View>('test')

  // Reflect the chosen theme on <html> so the CSS variables switch.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <>
      <LiquidBackground />
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <h1 className="font-mono text-2xl font-bold tracking-tight">
              key<span className="text-primary">flow</span>
            </h1>
            <nav className="flex gap-1 text-sm">
              <NavButton
                active={view === 'test'}
                onClick={() => setView('test')}
              >
                test
              </NavButton>
              <NavButton
                active={view === 'stats'}
                onClick={() => setView('stats')}
              >
                stats
              </NavButton>
              <NavButton
                active={view === 'coach'}
                onClick={() => setView('coach')}
              >
                coach
              </NavButton>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <LevelBadge />
            <ThemePicker />
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          {view === 'test' && <TypingView />}
          {view === 'stats' && <StatsView />}
          {view === 'coach' && <CoachView gotoTest={() => setView('test')} />}
        </main>

        <footer className="px-6 py-3 text-center text-xs text-subtle">
          100% local · no accounts · no tracking
        </footer>
      </div>
    </>
  )
}

function LevelBadge() {
  const xp = useProgress((s) => s.xp)
  const streak = useProgress((s) => s.streak)
  const level = levelFromXp(xp)
  const progress = levelProgress(xp)

  return (
    <div
      className="flex items-center gap-2 text-sm text-muted"
      title={`${xp} xp`}
    >
      <span className="font-mono font-semibold">lv {level}</span>
      <span className="h-1.5 w-14 overflow-hidden rounded-full bg-surface">
        <span
          className="block h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </span>
      {streak.current > 0 && (
        <span title="day streak">🔥 {streak.current}</span>
      )}
    </div>
  )
}

function NavButton({
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
        e.currentTarget.blur()
      }}
      className={`rounded-lg px-3 py-1 font-medium transition-colors ${
        active ? 'text-primary' : 'text-muted hover:text-fg'
      }`}
    >
      {children}
    </button>
  )
}
