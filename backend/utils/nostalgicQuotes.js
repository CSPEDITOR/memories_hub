/** Curated nostalgic quotes used when no AI key is configured. */
export const CURATED_QUOTES = [
  'Some chapters end so the best ones can begin.',
  'The campus never forgets the footsteps that made it home.',
  'We did not know we were making memories — we thought we were just having fun.',
  'Years from now, you will remember the people more than the syllabus.',
  'Every corridor holds a laugh that still echoes.',
  'The best stories were never in the textbooks.',
  'Hostel lights, exam nights, and friendships for life.',
  'IGIT was not just a college — it was a feeling.',
]

export function randomQuote() {
  return CURATED_QUOTES[Math.floor(Math.random() * CURATED_QUOTES.length)]
}
