import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchStories, viewStory } from '@/services/storyService.js'
import { useAuth } from '@/context/AuthContext.jsx'

/** Instagram-style story rings + auto-advance viewer (24h TTL on server) */
export function StoriesBar() {
  const { isAuthenticated } = useAuth()
  const [groups, setGroups] = useState([])
  const [viewer, setViewer] = useState(null)
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  const load = useCallback(async () => {
    try {
      const data = await fetchStories()
      setGroups(data)
    } catch {
      setGroups([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!viewer) return
    const st = viewer.stories
    const cur = st[index]
    if (!cur) {
      setViewer(null)
      setIndex(0)
      return
    }
    setProgress(0)
    const duration = 5200
    const start = Date.now()
    const tick = setInterval(() => {
      setProgress(Math.min(1, (Date.now() - start) / duration))
    }, 40)
    const done = setTimeout(() => {
      clearInterval(tick)
      if (index + 1 < st.length) {
        setIndex(index + 1)
      } else {
        setViewer(null)
        setIndex(0)
      }
    }, duration)
    return () => {
      clearInterval(tick)
      clearTimeout(done)
    }
  }, [viewer, index])

  useEffect(() => {
    if (!viewer) return
    const cur = viewer.stories[index]
    if (cur && isAuthenticated) viewStory(cur._id).catch(() => {})
  }, [viewer, index, isAuthenticated])

  const stories = viewer?.stories || []
  const current = stories[index]

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {groups.map((g) => (
          <button
            type="button"
            key={g.author._id}
            className="flex flex-col items-center gap-1 shrink-0 group"
            onClick={() => {
              setViewer({ stories: g.stories })
              setIndex(0)
              setProgress(0)
            }}
          >
            <div className="p-[3px] rounded-full bg-gradient-to-tr from-gold via-ember to-mist shadow-glow group-hover:scale-105 transition-transform">
              <div className="p-[2px] rounded-full bg-parchment dark:bg-night">
                <img
                  src={g.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(g.author.name)}`}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-xs text-stone-600 dark:text-stone-300 max-w-[5rem] truncate">{g.author.name}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {viewer && current && (
          <motion.div
            className="fixed inset-0 z-[90] bg-black/90 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewer(null)}
          >
            <div className="absolute top-6 left-4 right-4 flex gap-1" onClick={(e) => e.stopPropagation()}>
              {stories.map((_, i) => (
                <div key={i} className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-gold transition-all"
                    style={{
                      width: `${i < index ? 100 : i === index ? progress * 100 : 0}%`,
                    }}
                  />
                </div>
              ))}
            </div>
            {current.musicUrl && <audio key={current._id} src={current.musicUrl} autoPlay className="hidden" />}
            <motion.img
              key={current._id}
              src={current.mediaUrl}
              alt=""
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation()
                if (index + 1 < stories.length) {
                  setIndex((i) => i + 1)
                }
              }}
            />
            {current.caption && (
              <p className="mt-4 text-parchment text-center max-w-md px-4">{current.caption}</p>
            )}
            <p className="text-xs text-stone-400 mt-2">Tap image for next · Stories vanish after 24h</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
