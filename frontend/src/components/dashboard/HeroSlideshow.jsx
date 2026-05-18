import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchRandomMemories } from '@/services/memoryService.js'

/** Auto-changing hero with blurred backdrop stills */
export function HeroSlideshow() {
  const [slides, setSlides] = useState([])
  const [i, setI] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchRandomMemories()
        if (!cancelled) setSlides(data.filter((m) => m.images?.[0]))
      } catch {
        if (!cancelled) setSlides([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!slides.length) return
    const id = setInterval(() => setI((x) => (x + 1) % slides.length), 6000)
    return () => clearInterval(id)
  }, [slides])

  const cur = slides[i]

  return (
    <div className="relative h-[min(70vh,520px)] rounded-3xl overflow-hidden glass">
      <AnimatePresence mode="wait">
        {cur && (
          <motion.div
            key={cur._id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1 }}
            className="absolute inset-0"
          >
            <img src={cur.images[0]} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent dark:from-night dark:via-night/50" />
            <img src={cur.images[0]} alt="" className="relative z-10 w-full h-full object-contain drop-shadow-2xl" />
            <div className="absolute bottom-0 left-0 right-0 z-20 p-8 space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-gold">Echoes from campus</p>
              <h1 className="font-display text-4xl sm:text-5xl text-parchment max-w-xl">{cur.title}</h1>
              <p className="text-parchment/80 max-w-xl line-clamp-2">{cur.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
