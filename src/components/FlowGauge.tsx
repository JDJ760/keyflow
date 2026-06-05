/** Vertical "flow" gauge that fills with liquid as the test progresses. */
export function FlowGauge({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100
  return (
    <div
      className="gauge h-44 shrink-0 self-center"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label="test progress"
    >
      <div className="gauge-fill" style={{ height: `${pct}%` }} />
    </div>
  )
}
