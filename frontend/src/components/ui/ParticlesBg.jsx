import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

/** Subtle floating dust — nostalgic atmosphere (random layout is fixed for the session) */
export function ParticlesBg({ count = 28 }) {
  const [particles] = useState(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: 1 + Math.random() * 3,
      d: 12 + Math.random() * 40,
    }))
  )

  const items = useMemo(() => particles, [particles])

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10 opacity-40 dark:opacity-25">
      {items.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-gold/30 dark:bg-mist/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s }}
          animate={{ y: [0, -p.d, 0], x: [0, p.d * 0.3, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 8 + p.d / 10, repeat: Infinity, ease: 'easeInOut', delay: p.id * 0.15 }}
        />
      ))}
    </div>
  )
}
