import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDebounce } from '@/hooks/useDebounce.js'
import { searchAll } from '@/services/miscService.js'
import { fadeUp } from '@/animations/variants.js'
import { Link } from 'react-router-dom'
import Masonry from 'react-masonry-css'
import { MemoryCard } from '@/components/memories/MemoryCard.jsx'

const breakpoints = { default: 2, 768: 1 }

export function SearchPage() {
  const [q, setQ] = useState('')
  const dq = useDebounce(q, 400)
  const [res, setRes] = useState({ memories: [], users: [] })

  useEffect(() => {
    if (!dq.trim()) {
      setRes({ memories: [], users: [] })
      return
    }
    searchAll(dq).then(setRes).catch(() => setRes({ memories: [], users: [] }))
  }, [dq])

  return (
    <>
      <Helmet>
        <title>Search — IGIT Memories</title>
      </Helmet>
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
        <h1 className="font-display text-4xl text-stone-900 dark:text-parchment">Search the archive</h1>
        <input
          className="w-full max-w-xl rounded-2xl bg-white/70 dark:bg-white/5 border border-white/20 px-4 py-3"
          placeholder="Names, captions, departments…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {res.users.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-gold-dim">People</p>
            <div className="flex flex-wrap gap-3">
              {res.users.map((u) => (
                <Link key={u._id} to={`/profile/${u._id}`} className="glass px-3 py-2 rounded-xl text-sm flex items-center gap-2">
                  <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt="" className="w-8 h-8 rounded-full" />
                  <span>{u.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        {res.memories.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-gold-dim">Memories</p>
            <Masonry breakpointCols={breakpoints} className="flex -ml-4 w-auto" columnClassName="pl-4 bg-clip-padding">
              {res.memories.map((m) => (
                <MemoryCard key={m._id} memory={m} />
              ))}
            </Masonry>
          </div>
        )}
      </motion.div>
    </>
  )
}
