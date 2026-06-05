import type { TestConfig } from './types'
import { WORDS } from '../data/words'
import { QUOTES, type Quote } from '../data/quotes'
import { pick, type Rng } from './rng'

const PUNCTUATION = ['.', ',', '!', '?', ';', ':', "'"]

export interface GenerateOptions {
  punctuation?: boolean
  numbers?: boolean
}

/** Generate `count` random words, optionally salted with numbers/punctuation. */
export function generateWords(
  count: number,
  opts: GenerateOptions = {},
  rng: Rng = Math.random,
  pool: readonly string[] = WORDS,
): string[] {
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    if (opts.numbers && rng() < 0.12) {
      out.push(String(Math.floor(rng() * 1000)))
      continue
    }
    let word = pick(pool, rng)
    if (opts.punctuation && rng() < 0.15) {
      word = word + pick(PUNCTUATION, rng)
    }
    out.push(word)
  }
  return out
}

export function pickQuote(
  rng: Rng = Math.random,
  pool: readonly Quote[] = QUOTES,
): Quote {
  return pick(pool, rng)
}

export interface GeneratedText {
  words: string[]
  quoteSource?: string
}

/** Produce the initial target words for a given test configuration. */
export function textForConfig(
  config: TestConfig,
  rng: Rng = Math.random,
): GeneratedText {
  switch (config.mode) {
    case 'words':
      return { words: generateWords(config.wordCount, config, rng) }
    case 'quote': {
      const quote = pickQuote(rng)
      return { words: quote.text.split(' '), quoteSource: quote.source }
    }
    case 'time':
    case 'zen':
    default:
      // A generous starting buffer; the engine extends it as the user nears the end.
      return {
        words: generateWords(Math.max(80, config.wordCount), config, rng),
      }
  }
}
