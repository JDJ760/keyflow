import type { Keystroke, Session, TestConfig } from './types'
import { generateWords, textForConfig } from './generator'
import type { Rng } from './rng'

export function createSession(
  config: TestConfig,
  rng: Rng = Math.random,
): Session {
  const { words, quoteSource } = textForConfig(config, rng)
  return {
    config,
    words,
    status: 'idle',
    typed: [''],
    startedAt: null,
    finishedAt: null,
    keystrokes: [],
    quoteSource,
  }
}

export type Action =
  | { type: 'type'; char: string; now: number }
  | { type: 'backspace'; now: number }
  | { type: 'tick'; now: number }
  | { type: 'finish'; now: number }
  | { type: 'extend'; rng?: Rng }
  | { type: 'reset'; config: TestConfig; rng?: Rng }

const ENDS_ON_LAST_WORD = (config: TestConfig): boolean =>
  config.mode === 'words' || config.mode === 'quote'

export function reducer(state: Session, action: Action): Session {
  switch (action.type) {
    case 'type': {
      if (state.status === 'finished') return state
      const { char, now } = action
      const startedAt = state.status === 'idle' ? now : state.startedAt
      const t = startedAt != null ? now - startedAt : 0
      const idx = state.typed.length - 1
      const targetWord = state.words[idx] ?? ''
      const typedWord = state.typed[idx] ?? ''

      // Space advances to the next word (ignored if the word is still empty).
      if (char === ' ') {
        if (typedWord.length === 0) return state
        const keystroke: Keystroke = {
          t,
          expected: ' ',
          typed: ' ',
          correct: true,
        }
        const isLast = idx >= state.words.length - 1
        if (isLast && ENDS_ON_LAST_WORD(state.config)) {
          return finish(state, startedAt, now, keystroke)
        }
        return {
          ...state,
          status: 'running',
          startedAt,
          typed: [...state.typed, ''],
          keystrokes: [...state.keystrokes, keystroke],
        }
      }

      const expected = targetWord[typedWord.length] ?? ''
      const keystroke: Keystroke = {
        t,
        expected,
        typed: char,
        correct: char === expected,
      }
      const typed = [...state.typed]
      typed[idx] = typedWord + char

      const isLast = idx >= state.words.length - 1
      const reachedEnd =
        isLast &&
        ENDS_ON_LAST_WORD(state.config) &&
        typed[idx]!.length >= targetWord.length
      if (reachedEnd) {
        return { ...finish(state, startedAt, now, keystroke), typed }
      }
      return {
        ...state,
        status: 'running',
        startedAt,
        typed,
        keystrokes: [...state.keystrokes, keystroke],
      }
    }

    case 'backspace': {
      if (state.status === 'finished') return state
      const idx = state.typed.length - 1
      const typedWord = state.typed[idx] ?? ''
      if (typedWord.length > 0) {
        const typed = [...state.typed]
        typed[idx] = typedWord.slice(0, -1)
        return { ...state, typed }
      }
      // At the start of a word: step back into the previous word if it had errors.
      if (idx > 0) {
        const prevTyped = state.typed[idx - 1] ?? ''
        const prevTarget = state.words[idx - 1] ?? ''
        if (prevTyped !== prevTarget) {
          return { ...state, typed: state.typed.slice(0, idx) }
        }
      }
      return state
    }

    case 'tick': {
      if (state.status !== 'running') return state
      if (state.config.mode === 'time' && state.startedAt != null) {
        const endAt = state.startedAt + state.config.duration * 1000
        if (action.now >= endAt) {
          return { ...state, status: 'finished', finishedAt: endAt }
        }
      }
      return state
    }

    case 'finish':
      if (state.status === 'finished') return state
      return { ...state, status: 'finished', finishedAt: action.now }

    case 'extend': {
      const more = generateWords(30, state.config, action.rng ?? Math.random)
      return { ...state, words: [...state.words, ...more] }
    }

    case 'reset':
      return createSession(action.config, action.rng)

    default:
      return state
  }
}

function finish(
  state: Session,
  startedAt: number | null,
  now: number,
  keystroke: Keystroke,
): Session {
  return {
    ...state,
    status: 'finished',
    startedAt,
    finishedAt: now,
    keystrokes: [...state.keystrokes, keystroke],
  }
}
