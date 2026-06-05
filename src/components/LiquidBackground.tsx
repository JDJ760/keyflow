/** The signature Liquid Flow backdrop: slow-drifting gooey blobs. Purely
 * decorative, and the drift animation is disabled under prefers-reduced-motion. */
export function LiquidBackground() {
  return (
    <div className="liquid-bg" aria-hidden="true">
      <span className="blob blob-a" />
      <span className="blob blob-b" />
      <span className="blob blob-c" />
    </div>
  )
}
