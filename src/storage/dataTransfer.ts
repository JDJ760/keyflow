/**
 * Export / import all Keyflow data as a single JSON file. Reads the two
 * persisted localStorage keys directly so a backup round-trips exactly.
 * Everything stays on the user's device — this is just file in / file out.
 */
const KEYS = ['keyflow:settings', 'keyflow:progress', 'keyflow:coach'] as const

export function exportAll(): string {
  const data: Record<string, unknown> = {
    app: 'keyflow',
    version: 1,
    exportedAt: new Date().toISOString(),
  }
  for (const key of KEYS) {
    const raw = localStorage.getItem(key)
    if (raw) data[key] = JSON.parse(raw)
  }
  return JSON.stringify(data, null, 2)
}

export function importAll(json: string): void {
  const data = JSON.parse(json) as Record<string, unknown>
  for (const key of KEYS) {
    if (data[key] !== undefined) {
      localStorage.setItem(key, JSON.stringify(data[key]))
    }
  }
}

export function downloadExport(): void {
  const blob = new Blob([exportAll()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `keyflow-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
