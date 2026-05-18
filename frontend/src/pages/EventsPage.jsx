import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { fetchCategories } from '@/services/miscService.js'
import { fadeUp, stagger } from '@/animations/variants.js'

export function EventsPage() {
  const nav = useNavigate()
  const [cats, setCats] = useState([])

  useEffect(() => {
    fetchCategories().then(setCats).catch(() => setCats([]))
  }, [])

  return (
    <>
      <Helmet>
        <title>Events — IGIT Memories</title>
      </Helmet>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
        <motion.header variants={fadeUp}>
          <h1 className="font-display text-4xl text-stone-900 dark:text-parchment">Moments by chapter</h1>
          <p className="text-stone-500 mt-2 max-w-2xl">
            Tap a category to wander that hallway of memories — farewells, pujas, hostel nights, and classroom laughter.
          </p>
        </motion.header>
        <motion.div variants={fadeUp} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map((c) => (
            <motion.button
              key={c.slug}
              type="button"
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => nav(`/memories?category=${encodeURIComponent(c.name)}`)}
              className="text-left rounded-2xl glass p-5 border border-white/10 hover:shadow-glow transition-shadow"
            >
              <p className="font-display text-2xl text-stone-900 dark:text-parchment">{c.name}</p>
              <p className="text-sm text-stone-500 mt-2">{c.count} memories archived</p>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </>
  )
}
