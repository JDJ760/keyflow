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

const DRILL_FILLER = ['a', 'e', 'i', 'o', 'u', 't', 'n', 's']

/**
 * Words that exercise the given characters: real words weighted by how densely
 * they contain the targets, mixed with synthesized practice patterns (and pure
 * synthesis when the pool barely covers a rare letter like z or q).
 */
export function generateDrillWords(
  count: number,
  chars: string[],
  rng: Rng = Math.random,
  pool: readonly string[] = WORDS,
): string[] {
  if (chars.length === 0) return generateWords(count, {}, rng, pool)
  const targets = new Set(chars)
  const weighted: { word: string; weight: number }[] = []
  for (const word of pool) {
    let matches = 0
    for (const c of word) if (targets.has(c)) matches++
    if (matches > 0)
      weighted.push({ word, weight: matches + matches / word.length })
  }
  const total = weighted.reduce((sum, w) => sum + w.weight, 0)

  const out: string[] = []
  for (let i = 0; i < count; i++) {
    if (weighted.length < 8 || rng() < 0.25) {
      out.push(synthesizeDrillWord(chars, rng))
      continue
    }
    let r = rng() * total
    let picked = weighted[weighted.length - 1]!.word
    for (const w of weighted) {
      r -= w.weight
      if (r <= 0) {
        picked = w.word
        break
      }
    }
    out.push(picked)
  }
  return out
}

function synthesizeDrillWord(chars: string[], rng: Rng): string {
  const len = 3 + Math.floor(rng() * 3)
  let word = ''
  for (let i = 0; i < len; i++) {
    word += i % 2 === 0 ? pick(chars, rng) : pick(DRILL_FILLER, rng)
  }
  return word
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
  if (config.drillChars && config.drillChars.length > 0) {
    const count =
      config.mode === 'words'
        ? config.wordCount
        : Math.max(80, config.wordCount)
    return { words: generateDrillWords(count, config.drillChars, rng) }
  }
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
