import { createSession, reducer } from './session'
import { mulberry32 } from './rng'
import type { Session, TestConfig } from './types'

const wordsConfig: TestConfig = {
  mode: 'words',
  duration: 30,
  wordCount: 3,
  punctuation: false,
  numbers: false,
}

function typeString(start: Session, text: string): Session {
  let state = start
  let now = 0
  for (const ch of text) {
    now += 100
    state = reducer(state, { type: 'type', char: ch, now })
  }
  return state
}

describe('reducer', () => {
  it('starts running and records startedAt on the first keystroke', () => {
    const s = createSession(wordsConfig, mulberry32(1))
    const next = reducer(s, { type: 'type', char: s.words[0]![0]!, now: 1000 })
    expect(next.status).toBe('running')
    expect(next.startedAt).toBe(1000)
    expect(next.keystrokes).toHaveLength(1)
  })

  it('advances to the next word on space', () => {
    const s = createSession(wordsConfig, mulberry32(1))
    let state = typeString(s, s.words[0]!)
    state = reducer(state, { type: 'type', char: ' ', now: 9999 })
    expect(state.typed).toHaveLength(2)
    expect(state.typed[1]).toBe('')
  })

  it('ignores a leading space', () => {
    const s = createSession(wordsConfig, mulberry32(1))
    expect(reducer(s, { type: 'type', char: ' ', now: 500 })).toBe(s)
  })

  it('removes the last character on backspace', () => {
    const s = createSession(wordsConfig, mulberry32(1))
    let state = typeString(s, 'ab')
    state = reducer(state, { type: 'backspace', now: 5000 })
    expect(state.typed[0]).toBe('a')
  })

  it('finishes when the last word of a words test is completed', () => {
    const s = createSession(wordsConfig, mulberry32(1))
    const state = typeString(s, s.words.join(' '))
    expect(state.status).toBe('finished')
    expect(state.finishedAt).not.toBeNull()
  })

  it('finishes a timed test on a tick past the duration', () => {
    const timeConfig: TestConfig = {
      ...wordsConfig,
      mode: 'time',
      duration: 15,
    }
    const s = createSession(timeConfig, mulberry32(1))
    let state = reducer(s, { type: 'type', char: s.words[0]![0]!, now: 0 })
    state = reducer(state, { type: 'tick', now: 15000 })
    expect(state.status).toBe('finished')
  })

  it('does not finish a timed test before the duration', () => {
    const timeConfig: TestConfig = {
      ...wordsConfig,
      mode: 'time',
      duration: 15,
    }
    const s = createSession(timeConfig, mulberry32(1))
    let state = reducer(s, { type: 'type', char: s.words[0]![0]!, now: 0 })
    state = reducer(state, { type: 'tick', now: 5000 })
    expect(state.status).toBe('running')
  })
})
