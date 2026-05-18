import { useEffect, useState } from 'react'

/** Simple typing animation for hero quotes */
export function useTypingQuote(text, speed = 42) {
  const [out, setOut] = useState('')

  useEffect(() => {
    if (!text) {
      setOut('')
      return
    }
    let i = 0
    setOut('')
    const id = setInterval(() => {
      i += 1
      setOut(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return out
}
