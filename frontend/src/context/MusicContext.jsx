import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const MusicContext = createContext(null)

/** Optional ambient loop — user toggle (no copyrighted assets bundled) */
export function MusicProvider({ children }) {
  const [enabled, setEnabled] = useState(false)
  const audioRef = useRef(null)

  const toggle = useCallback(() => {
    setEnabled((e) => {
      const next = !e
      if (next) {
        if (!audioRef.current) {
          const a = new Audio()
          /** Placeholder: user can set VITE_AMBIENT_MUSIC_URL to a self-hosted loop */
          a.src = import.meta.env.VITE_AMBIENT_MUSIC_URL || ''
          a.loop = true
          a.volume = 0.2
          audioRef.current = a
        }
        if (audioRef.current?.src) {
          audioRef.current.play().catch(() => {})
        }
      } else {
        audioRef.current?.pause()
      }
      return next
    })
  }, [])

  const value = useMemo(() => ({ enabled, toggle }), [enabled, toggle])
  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}

export function useMusic() {
  return useContext(MusicContext) || { enabled: false, toggle: () => {} }
}
