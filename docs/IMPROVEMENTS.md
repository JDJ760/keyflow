# Improvement Notes

A living backlog from periodic code-review passes. Items marked ✔ have been
addressed; the rest are known, accepted-for-now trade-offs or future work.

## Fixed in the 2026-06-10 review pass

- ✔ **Enter to retry** — the results screen promised "tab or enter to retry"
  but only Tab was wired. Enter now restarts from the results screen.
- ✔ **Zen mode was unfinishable** — nothing ever dispatched `finish`, so zen
  could never reach the results screen. Escape now ends a running zen test
  (and the on-screen hint says so).
- ✔ **Focus stuck on clicked controls** — after clicking a config chip, nav
  button, theme select, or retry button, the control kept focus, so the next
  Space/Enter (or letter keys, on the select) re-triggered the control instead
  of feeding the test. All interactive controls now blur after activation.
- ✔ **Production CSP allowed `ws:`/`wss:` to any host** — only the Vite dev
  server needs WebSockets (HMR). A build-time HTML transform now ships
  `connect-src 'self'` in production.

## Engine / correctness

- Words and quote tests finish when the final word reaches full _length_, even
  if the last character is wrong. Consider requiring the final character (or a
  trailing space) to be correct before auto-finishing.
- Accuracy counts every keystroke, including errors you later fix (standard
  Monkeytype-style behavior, but worth a tooltip in the UI).
- `bestKey('zen')` lumps zen runs of any length into one personal-best bucket;
  consider duration buckets if zen gets used competitively.
- Practice calendar: day stepping uses fixed 24 h increments, which can drift
  ±1 h across DST changes, and "today" is captured at module load (stale if
  the tab stays open past midnight). Cosmetic-only.
- The keystroke log grows unbounded during very long zen sessions; cap or
  summarize past a few thousand entries.

## UX

- **Mobile**: there is no hidden input element, so touch keyboards never open.
  Desktop-first for now; add a focus-proxy input for mobile later.
- Quote attribution (`session.quoteSource`) is captured but never displayed on
  the results screen — show "— Charles Dickens" under quote results.
- `confirm()`/`alert()` in DataControls work but feel raw; replace with inline
  confirmation UI.
- Caret scrolling uses `scrollIntoView` on the page; scrolling the words
  container directly would be smoother for long passages.
- Word-count tests longer than the visible area rely on caret scrolling; a
  fade-out mask at the bottom edge would look more polished.

## Accessibility (planned as part of Phase 6)

- The typing area has no `aria-live` region; results should be announced.
- Heatmap and calendar need text alternatives (tables or descriptions).
- Audit focus outlines across all five themes for contrast.

## Performance

- `TypingArea` re-renders every word on each keystroke. Fine at ≤100 words;
  memoize `Word` if long zen sessions feel sluggish.
- Stats recompute (`computeStats`) runs on every 100 ms tick; cheap today,
  but consider computing live WPM from a sliding window instead.

## Security / supply chain

- Merge Dependabot's `actions/checkout@v6` and `actions/setup-node` bumps
  (GitHub is deprecating Node 20 action runtimes mid-2026).
- Consider adding a CodeQL workflow for static analysis.
- Keep the zero-external-requests guarantee — never add CDN assets.

## Product backlog (beyond the phase roadmap)

- **Progressive key unlock** (Keybr-style) — deferred from Phase 3.
- Per-finger analytics once `data/layouts.ts` ships a finger map.
- Daily challenge using the seedable RNG (`mulberry32`) so everyone gets the
  same text on a given day.
- Sound packs (mechanical thock, combo chimes) with a volume setting.
- Result-card image export for sharing.
