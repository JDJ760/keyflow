import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
import type { Session } from '../engine/types'

/** Renders the target words with per-character correct/incorrect/extra states
 * and the droplet caret at the active position. */
export function TypingArea({ session }: { session: Session }) {
  const caretRef = useRef<HTMLSpanElement>(null)
  const activeIndex =
    session.status === 'finished' ? -1 : session.typed.length - 1
  const caretPos =
    activeIndex >= 0 ? (session.typed[activeIndex]?.length ?? 0) : -1

  // Keep the caret in view as the user types through long passages.
  // (scrollIntoView is missing in jsdom, hence the optional call.)
  useEffect(() => {
    caretRef.current?.scrollIntoView?.({ block: 'center', behavior: 'auto' })
  }, [activeIndex, caretPos])

  return (
    <div className="typing max-h-[8.2em] overflow-hidden text-left select-none">
      {session.words.map((target, i) => (
        <Word
          key={i}
          target={target}
          typed={
            i < session.typed.length ? (session.typed[i] ?? '') : undefined
          }
          active={i === activeIndex}
          caretPos={i === activeIndex ? caretPos : -1}
          caretRef={caretRef}
        />
      ))}
    </div>
  )
}

interface WordProps {
  target: string
  typed: string | undefined
  active: boolean
  caretPos: number
  caretRef: RefObject<HTMLSpanElement | null>
}

function Word({ target, typed, active, caretPos, caretRef }: WordProps) {
  const len = Math.max(target.length, typed?.length ?? 0)
  const nodes: ReactNode[] = []

  for (let j = 0; j < len; j++) {
    if (active && j === caretPos) {
      nodes.push(<span key={`caret-${j}`} ref={caretRef} className="caret" />)
    }
    const targetChar = target[j]
    const typedChar = typed?.[j]
    if (targetChar === undefined) {
      nodes.push(
        <span key={j} className="char extra">
          {typedChar}
        </span>,
      )
    } else {
      const status =
        typedChar === undefined
          ? ''
          : typedChar === targetChar
            ? 'correct'
            : 'incorrect'
      nodes.push(
        <span key={j} className={`char ${status}`}>
          {targetChar}
        </span>,
      )
    }
  }

  if (active && caretPos >= len) {
    nodes.push(<span key="caret-end" ref={caretRef} className="caret" />)
  }

  return <span className="word">{nodes}</span>
}
