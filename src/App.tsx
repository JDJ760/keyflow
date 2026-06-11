import { useEffect, useState, type ReactNode } from 'react'
import { useSettings } from './store/settings'
import { LiquidBackground } from './components/LiquidBackground'
import { TypingView } from './views/TypingView'
import { StatsView } from './views/StatsView'
import { ThemePicker } from './components/ThemePicker'

type View = 'test' | 'stats'

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
            </nav>
          </div>
          <ThemePicker />
        </header>

        <main className="flex flex-1 flex-col">
          {view === 'test' ? <TypingView /> : <StatsView />}
        </main>

        <footer className="px-6 py-3 text-center text-xs text-subtle">
          100% local · no accounts · no tracking
        </footer>
      </div>
    </>
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
