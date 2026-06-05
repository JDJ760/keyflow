export type TestMode = 'time' | 'words' | 'quote' | 'zen'

export interface TestConfig {
  mode: TestMode
  /** seconds — used when mode === 'time' */
  duration: number
  /** word count — used when mode === 'words' */
  wordCount: number
  punctuation: boolean
  numbers: boolean
}

export type TestStatus = 'idle' | 'running' | 'finished'

export interface Keystroke {
  /** milliseconds since the test started */
  t: number
  /** the character that was expected at this position ('' if past the word) */
  expected: string
  /** the character the user actually typed */
  typed: string
  correct: boolean
}

export interface Session {
  config: TestConfig
  /** the target words to type */
  words: string[]
  status: TestStatus
  /**
   * What the user has typed, one entry per word they've reached. The last entry
   * is the word currently being typed. Index-aligned with `words`.
   */
  typed: string[]
  /** ms timestamp of the first keystroke, or null before the test starts */
  startedAt: number | null
  /** ms timestamp when the test finished, or null while idle/running */
  finishedAt: number | null
  /** every counted keystroke, for accuracy, consistency and per-key analysis */
  keystrokes: Keystroke[]
  /** optional attribution when the text came from a quote */
  quoteSource?: string
}

export interface Stats {
  wpm: number
  rawWpm: number
  /** percentage 0–100 */
  accuracy: number
  /** percentage 0–100 */
  consistency: number
  correctChars: number
  incorrectChars: number
  extraChars: number
  missedChars: number
  elapsedMs: number
}
