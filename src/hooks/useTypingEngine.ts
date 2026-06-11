import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { createSession, reducer } from '../engine/session'
import { computeStats } from '../engine/metrics'
import type { TestConfig } from '../engine/types'

/**
 * Drives a typing test: owns the session reducer, captures keyboard input,
 * runs the live timer, refills endless modes, and exposes live stats.
 */
export function useTypingEngine(config: TestConfig) {
  const [session, dispatch] = useReducer(reducer, config, (c) =>
    createSession(c),
  )
  const [now, setNow] = useState(() => Date.now())

  const restart = useCallback(() => {
    dispatch({ type: 'reset', config })
    setNow(Date.now())
  }, [config])

  // Start a fresh session whenever the configuration changes (skip first mount).
  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    dispatch({ type: 'reset', config })
    setNow(Date.now())
  }, [config])

  // Live timer: drives the countdown + live WPM and ends timed tests.
  useEffect(() => {
    if (session.status !== 'running') return
    const id = window.setInterval(() => {
      const t = Date.now()
      setNow(t)
      dispatch({ type: 'tick', now: t })
    }, 100)
    return () => window.clearInterval(id)
  }, [session.status])

  // Keep a buffer of upcoming words for endless (time / zen) modes.
  useEffect(() => {
    if (
      (config.mode === 'time' || config.mode === 'zen') &&
      session.words.length - session.typed.length < 15
    ) {
      dispatch({ type: 'extend' })
    }
  }, [config.mode, session.words.length, session.typed.length])

  // Keyboard input.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Tab') {
        e.preventDefault()
        dispatch({ type: 'reset', config })
        setNow(Date.now())
        return
      }
      // Enter retries from the results screen (the on-screen hint promises it).
      if (e.key === 'Enter') {
        if (session.status === 'finished') {
          e.preventDefault()
          dispatch({ type: 'reset', config })
          setNow(Date.now())
        }
        return
      }
      // Zen has no natural end — Escape finishes it and shows results.
      if (e.key === 'Escape') {
        if (session.status === 'running' && config.mode === 'zen') {
          e.preventDefault()
          dispatch({ type: 'finish', now: Date.now() })
        }
        return
      }
      if (session.status === 'finished') return
      if (e.key === 'Backspace') {
        e.preventDefault()
        dispatch({ type: 'backspace', now: Date.now() })
        return
      }
      if (e.key === ' ') {
        e.preventDefault()
        dispatch({ type: 'type', char: ' ', now: Date.now() })
        return
      }
      if (e.key.length === 1) {
        dispatch({ type: 'type', char: e.key, now: Date.now() })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [session.status, config])

  const stats = useMemo(() => computeStats(session, now), [session, now])

  // Remaining seconds for timed mode (for the countdown display).
  const remainingMs =
    config.mode === 'time' && session.startedAt != null
      ? Math.max(0, session.startedAt + config.duration * 1000 - now)
      : null

  return { session, stats, now, remainingMs, restart }
}
