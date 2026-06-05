export interface Quote {
  text: string
  source: string
}

/**
 * Public-domain quotations (classic literature, historical speeches) and
 * uncopyrightable proverbs. Safe to ship without licensing concerns.
 */
export const QUOTES: Quote[] = [
  {
    text: 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness.',
    source: 'Charles Dickens, A Tale of Two Cities',
  },
  {
    text: 'All that we see or seem is but a dream within a dream.',
    source: 'Edgar Allan Poe',
  },
  {
    text: 'To be, or not to be, that is the question.',
    source: 'William Shakespeare, Hamlet',
  },
  {
    text: 'I think, therefore I am.',
    source: 'René Descartes',
  },
  {
    text: 'A journey of a thousand miles begins with a single step.',
    source: 'Laozi',
  },
  {
    text: 'The only thing we have to fear is fear itself.',
    source: 'Franklin D. Roosevelt',
  },
  {
    text: 'The unexamined life is not worth living.',
    source: 'Socrates',
  },
  {
    text: 'It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife.',
    source: 'Jane Austen, Pride and Prejudice',
  },
  {
    text: 'We hold these truths to be self-evident, that all men are created equal.',
    source: 'United States Declaration of Independence',
  },
  {
    text: 'Whether you think you can or you think you cannot, you are right.',
    source: 'common saying',
  },
  {
    text: 'Actions speak louder than words, and the proof of the pudding is in the eating.',
    source: 'proverb',
  },
  {
    text: 'In the middle of difficulty lies opportunity.',
    source: 'attributed to Albert Einstein',
  },
]
