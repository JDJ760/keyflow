import { useSettings, THEME_OPTIONS, type ThemeName } from '../store/settings'

/** Compact theme selector in the header — swaps the whole palette at runtime. */
export function ThemePicker() {
  const theme = useSettings((s) => s.theme)
  const setTheme = useSettings((s) => s.setTheme)

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      <span className="hidden sm:inline">theme</span>
      <select
        value={theme}
        onChange={(e) => {
          setTheme(e.target.value as ThemeName)
          // Release focus so typing afterwards doesn't navigate the select.
          e.currentTarget.blur()
        }}
        aria-label="theme"
        className="cursor-pointer rounded-lg bg-surface/70 px-2 py-1 text-fg backdrop-blur transition-colors hover:text-primary focus:ring-2 focus:ring-primary focus:outline-none"
      >
        {THEME_OPTIONS.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  )
}
