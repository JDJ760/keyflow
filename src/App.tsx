import { useEffect } from 'react'
import { useSettings } from './store/settings'
import { LiquidBackground } from './components/LiquidBackground'
import { TypingView } from './views/TypingView'

export default function App() {
  const theme = useSettings((s) => s.theme)
  const setTheme = useSettings((s) => s.setTheme)

  // Reflect the chosen theme on <html> so the CSS variables switch.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <>
      <LiquidBackground />
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-4">
          <h1 className="font-mono text-2xl font-bold tracking-tight">
            key<span className="text-primary">flow</span>
          </h1>
          <button
            type="button"
            onClick={() => setTheme(theme === 'liquid' ? 'light' : 'liquid')}
            className="text-sm text-muted transition-colors hover:text-fg"
          >
            {theme === 'liquid' ? '◐ light' : '◑ dark'}
          </button>
        </header>

        <main className="flex flex-1 flex-col">
          <TypingView />
        </main>

        <footer className="px-6 py-3 text-center text-xs text-subtle">
          100% local · no accounts · no tracking
        </footer>
      </div>
    </>
  )
}
