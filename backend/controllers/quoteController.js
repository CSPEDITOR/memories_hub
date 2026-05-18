import { randomQuote, CURATED_QUOTES } from '../utils/nostalgicQuotes.js'
import { asyncHandler } from '../utils/asyncHandler.js'

/**
 * Returns a nostalgic quote — uses OpenAI when configured, else curated lines.
 */
export const getNostalgicQuote = asyncHandler(async (_req, res) => {
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    return res.json({ quote: randomQuote(), source: 'curated' })
  }
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You write one short nostalgic quote (max 25 words) about college friendship, farewell, and memories. No hashtags. Plain text only.',
          },
          { role: 'user', content: 'Give me one new quote.' },
        ],
        max_tokens: 80,
        temperature: 1,
      }),
    })
    if (!r.ok) throw new Error('OpenAI error')
    const data = await r.json()
    const quote = data.choices?.[0]?.message?.content?.trim()
    if (quote) return res.json({ quote, source: 'ai' })
  } catch {
    /* fall through */
  }
  res.json({ quote: randomQuote(), source: 'curated' })
})

export const listCurated = asyncHandler(async (_req, res) => {
  res.json(CURATED_QUOTES)
})
