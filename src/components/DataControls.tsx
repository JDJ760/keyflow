import { useRef, type ChangeEvent } from 'react'
import { useProgress } from '../store/progress'
import { downloadExport, importAll } from '../storage/dataTransfer'

/** Export / import / clear — the user's data is local, so they fully control it. */
export function DataControls() {
  const clearAll = useProgress((s) => s.clearAll)
  const fileRef = useRef<HTMLInputElement>(null)

  function onImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importAll(String(reader.result))
        location.reload()
      } catch {
        alert('That file could not be imported — is it a Keyflow backup?')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <button
        type="button"
        onClick={downloadExport}
        className="rounded-lg bg-primary px-3 py-1.5 font-medium text-on-primary transition-transform hover:scale-[1.03]"
      >
        export backup
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="rounded-lg bg-surface/70 px-3 py-1.5 font-medium text-fg transition-colors hover:text-primary"
      >
        import
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        onChange={onImport}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => {
          if (confirm('Clear all your local stats? This cannot be undone.')) {
            clearAll()
          }
        }}
        className="rounded-lg px-3 py-1.5 font-medium text-error transition-colors hover:bg-error/10"
      >
        clear data
      </button>
      <span className="text-subtle">your stats never leave this device.</span>
    </div>
  )
}
