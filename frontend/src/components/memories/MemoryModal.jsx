import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Download, Share2, MessageCircle } from 'lucide-react'
import * as memoryService from '@/services/memoryService.js'
import * as commentService from '@/services/commentService.js'
import { formatFull, formatRelative } from '@/utils/formatDate.js'
import { isOldMemory } from '@/utils/memoryVisual.js'
import { useAuth } from '@/context/AuthContext.jsx'

export default function MemoryModal({ memoryId: initialId, onClose }) {
  const { user, isAuthenticated } = useAuth()
  const [activeId, setActiveId] = useState(initialId)
  const [memory, setMemory] = useState(null)
  const [related, setRelated] = useState([])
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [colorized, setColorized] = useState(false)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    let cancelled = false
    setMemory(null)
    setIdx(0)
    ;(async () => {
      try {
        const [m, rel, c] = await Promise.all([
          memoryService.fetchMemory(activeId),
          memoryService.fetchRelated(activeId),
          commentService.fetchComments(activeId),
        ])
        if (!cancelled) {
          setMemory(m)
          setRelated(rel)
          setComments(c)
          setColorized(!isOldMemory(m.memoryDate))
          memoryService.bumpView(activeId).catch(() => {})
        }
      } catch {
        if (!cancelled) onClose()
      }
    })()
    return () => {
      cancelled = true
    }
  }, [activeId, onClose])

  if (!memory) {
    return createPortal(
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-10 h-10 rounded-full border-2 border-white/30 border-t-ember animate-spin"
          aria-label="Loading"
        />
      </motion.div>,
      document.body
    )
  }

  const userId = user?._id || user?.id
  const liked = (memory.likes || []).some((id) => String(id) === String(userId))
  const old = isOldMemory(memory.memoryDate)
  const showBw = old && !colorized
  const img = memory.images?.[idx] || memory.images?.[0]
  const eventLabel = memory.eventCategory || memory.event

  const submitComment = async (e) => {
    e.preventDefault()
    if (!isAuthenticated || !text.trim()) return
    const c = await commentService.postComment(activeId, text.trim())
    setComments((prev) => [c, ...prev])
    setText('')
  }

  const toggleLike = async () => {
    if (!isAuthenticated) return
    const updated = await memoryService.likeMemory(activeId)
    setMemory(updated)
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = img
    a.download = `${memory.title || 'memory'}.jpg`
    a.target = '_blank'
    a.rel = 'noreferrer'
    a.click()
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/90 backdrop-blur-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={onClose}
      >
        <motion.div
          layout
          className="relative w-full max-w-6xl max-h-[100dvh] sm:max-h-[94vh] overflow-hidden sm:rounded-3xl bg-stone-950/95 border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row"
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 border border-white/15"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className="lg:w-[58%] relative bg-black flex items-center justify-center min-h-[45vh] lg:min-h-0"
            onClick={() => {
              if (old && !colorized) setColorized(true)
            }}
          >
            <motion.img
              key={img}
              src={img}
              alt={memory.title}
              className={`max-h-[55vh] lg:max-h-[88vh] w-full object-contain ${showBw ? 'memory-bw' : 'memory-color'}`}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            />
            {old && !colorized && (
              <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/60 pointer-events-none">
                Tap image to reveal color
              </p>
            )}
            {memory.images?.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {memory.images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-8 bg-ember' : 'w-2 bg-white/35 hover:bg-white/55'}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setIdx(i)
                    }}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:w-[42%] flex flex-col min-h-0 border-t lg:border-t-0 lg:border-l border-white/10">
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
              <div className="flex items-center gap-3 pr-10">
                <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-ember/40 bg-stone-800 shrink-0">
                  {memory.author?.avatar ? (
                    <img src={memory.author.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-orange-400 to-amber-600">
                      {memory.author?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{memory.author?.name}</p>
                  <p className="text-xs text-stone-400">{formatRelative(memory.createdAt)}</p>
                </div>
              </div>

              {eventLabel && (
                <span className="inline-block text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-ember/20 text-orange-200 border border-ember/30">
                  {eventLabel}
                </span>
              )}

              <div>
                <h2 className="font-display text-2xl sm:text-3xl text-white leading-tight">{memory.title}</h2>
                {memory.description && (
                  <p className="text-sm text-stone-300 mt-3 leading-relaxed whitespace-pre-wrap">{memory.description}</p>
                )}
              </div>

              <div className="text-sm space-y-1.5 text-stone-400">
                <p>
                  <span className="text-orange-300/90">Captured</span> {formatFull(memory.memoryDate)}
                </p>
                {memory.location && (
                  <p>
                    <span className="text-orange-300/90">Where</span> {memory.location}
                  </p>
                )}
              </div>

              {memory.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {memory.tags.map((t) => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-stone-200">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={toggleLike}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors border border-white/10"
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-ember text-ember' : ''}`} />
                  {memory.likesCount ?? memory.likes?.length ?? 0}
                </button>
                <button
                  type="button"
                  onClick={download}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10"
                >
                  <Download className="w-5 h-5" /> Save
                </button>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
                  <MessageCircle className="w-4 h-4 text-ember" /> Comments
                </p>
                <form onSubmit={submitComment} className="flex gap-2 mb-4">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={isAuthenticated ? 'Share a warm note…' : 'Sign in to comment'}
                    disabled={!isAuthenticated}
                    className="flex-1 rounded-xl bg-white/10 border border-white/15 px-3 py-2.5 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-ember/40"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-ember hover:bg-orange-600 font-medium text-sm text-white disabled:opacity-50"
                    disabled={!isAuthenticated}
                  >
                    Post
                  </button>
                </form>
                <ul className="space-y-3 max-h-40 overflow-y-auto pr-1 no-scrollbar">
                  {comments.length === 0 && (
                    <li className="text-sm text-stone-500">No comments yet — be the first.</li>
                  )}
                  {comments.map((c) => (
                    <li key={c._id} className="text-sm border-b border-white/10 pb-3">
                      <span className="font-medium text-white">{c.author?.name}</span>
                      <span className="text-stone-500 text-xs ml-2">{formatRelative(c.createdAt)}</span>
                      <p className="text-stone-300 mt-1">{c.text}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {related.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2 text-white">Related memories</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {related.map((r) => (
                      <button
                        type="button"
                        key={r._id}
                        className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/15 hover:border-ember/50 transition-colors"
                        onClick={() => setActiveId(r._id)}
                      >
                        <img src={r.images?.[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
