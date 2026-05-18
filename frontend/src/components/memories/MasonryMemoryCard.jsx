import { useState, useMemo, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Bookmark, Share2, Maximize2 } from 'lucide-react'
import { formatRelative } from '@/utils/formatDate.js'
import { useAuth } from '@/context/AuthContext.jsx'
import { isOldMemory } from '@/utils/memoryVisual.js'
import * as memoryService from '@/services/memoryService.js'
import { cardReveal } from '@/animations/variants.js'

const MemoryModal = lazy(() => import('@/components/memories/MemoryModal.jsx'))

const HEIGHT_CLASSES = ['h-52', 'h-64', 'h-72', 'h-80', 'h-96', 'h-[22rem]', 'h-60', 'h-[18rem]']

function hashIndex(id = '') {
  return [...String(id)].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
}

function getCardHeightClass(id) {
  return HEIGHT_CLASSES[hashIndex(id) % HEIGHT_CLASSES.length]
}

function GlassAction({ label, onClick, children, className = '' }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className={`p-2.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/35 text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/35 transition-colors ${className}`}
    >
      {children}
    </motion.button>
  )
}

/** Pinterest-style masonry memory card with cinematic nostalgia */
export function MasonryMemoryCard({ memory, onUpdate, commentCount, index = 0 }) {
  const { isAuthenticated, user } = useAuth()
  const [hovered, setHovered] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const userId = user?._id || user?.id
  const liked = useMemo(
    () => (memory.likes || []).some((id) => String(id) === String(userId)),
    [memory.likes, userId]
  )

  const author = memory.author
  const img = memory.images?.[0]
  const eventLabel = memory.eventCategory || memory.event || 'Memory'
  const heightClass = getCardHeightClass(memory._id)
  const nostalgic = isOldMemory(memory.memoryDate) || hashIndex(memory._id) % 4 === 0
  const likeCount = memory.likesCount ?? memory.likes?.length ?? 0
  const comments = commentCount ?? memory.commentCount ?? memory.comments?.length ?? 0
  const uploadedAt = memory.memoryDate ? formatRelative(memory.memoryDate) : formatRelative(memory.createdAt)

  const handleLike = async (e) => {
    e.stopPropagation()
    if (!isAuthenticated) return
    const updated = await memoryService.likeMemory(memory._id)
    onUpdate?.(updated)
  }

  const handleSave = async (e) => {
    e.stopPropagation()
    if (!isAuthenticated) return
    await memoryService.saveMemory(memory._id)
  }

  const handleShare = (e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(`${window.location.origin}/memories#${memory._id}`)
  }

  const openModal = (e) => {
    e?.stopPropagation?.()
    setModalOpen(true)
  }

  return (
    <>
      <motion.article
        variants={cardReveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        transition={{ delay: Math.min(index * 0.04, 0.35) }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={{ y: -4 }}
        className="group relative mb-4 break-inside-avoid cursor-pointer"
        onClick={openModal}
      >
        <motion.div
          className={`relative overflow-hidden rounded-2xl bg-stone-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(234,88,12,0.12)] transition-shadow duration-500 ${heightClass}`}
        >
          <motion.img
            src={img}
            alt={memory.title || 'Memory'}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
              nostalgic
                ? 'grayscale-[0.85] contrast-[1.05] brightness-[0.92] group-hover:grayscale-[0.15] group-hover:brightness-100'
                : 'grayscale-0'
            } ${hovered ? 'scale-[1.04]' : 'scale-100'}`}
          />

          {nostalgic && (
            <motion.div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(28,25,23,0.35)_100%)] mix-blend-multiply"
              animate={{ opacity: hovered ? 0.35 : 0.55 }}
              transition={{ duration: 0.5 }}
            />
          )}

          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
            animate={{ opacity: hovered ? 0.95 : 0.85 }}
            transition={{ duration: 0.35 }}
          />

          <span className="absolute top-3 left-3 z-10 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 text-stone-700 shadow-sm">
            {eventLabel}
          </span>

          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center gap-2 px-3"
                onClick={(e) => e.stopPropagation()}
              >
                <GlassAction label="Like" onClick={handleLike}>
                  <Heart className={`w-4 h-4 ${liked ? 'fill-ember text-ember' : ''}`} />
                </GlassAction>
                <GlassAction label="Save" onClick={handleSave}>
                  <Bookmark className="w-4 h-4" />
                </GlassAction>
                <GlassAction label="Share" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </GlassAction>
                <GlassAction label="Expand" onClick={openModal}>
                  <Maximize2 className="w-4 h-4" />
                </GlassAction>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="absolute bottom-0 left-0 right-0 z-10 p-3.5 space-y-2"
            animate={{ y: hovered ? 0 : 4 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              className="flex items-center gap-2.5"
              animate={{ opacity: hovered ? 1 : 0.92 }}
            >
              <motion.div
                className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/40 shrink-0 bg-stone-200"
                whileHover={{ scale: 1.05 }}
              >
                {author?.avatar ? (
                  <img src={author.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-orange-400 to-amber-600">
                    {author?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </motion.div>
              <motion.div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate leading-tight">
                  {author?.name || 'Student'}
                </p>
                <p className="text-[11px] text-white/75">{uploadedAt}</p>
              </motion.div>
              <div className="flex items-center gap-1 text-white/95 text-xs font-medium shrink-0">
                <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-ember text-ember' : ''}`} />
                <span>{likeCount}</span>
              </div>
            </motion.div>

            {memory.description && (
              <motion.p
                className="text-xs text-white/85 line-clamp-2 leading-relaxed"
                initial={false}
                animate={{ opacity: hovered ? 1 : 0.75 }}
              >
                {memory.description}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </motion.article>

      {modalOpen && (
        <Suspense fallback={null}>
          <MemoryModal memoryId={memory._id} onClose={() => setModalOpen(false)} />
        </Suspense>
      )}
    </>
  )
}
