import { useState, useMemo, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Bookmark, Share2, Maximize2 } from 'lucide-react'
import { formatRelative } from '@/utils/formatDate.js'
import { useAuth } from '@/context/AuthContext.jsx'
import { isOldMemory } from '@/utils/memoryVisual.js'
import * as memoryService from '@/services/memoryService.js'
import { cardReveal } from '@/animations/variants.js'

const MemoryModal = lazy(() => import('@/components/memories/MemoryModal.jsx'))

/** Varied aspect ratios for masonry; capped on mobile so tall portraits don't overflow */
const ASPECT_CLASSES = [
  'aspect-[3/4]',
  'aspect-[4/5]',
  'aspect-square',
  'aspect-[2/3]',
  'aspect-[5/6]',
  'aspect-[3/5]',
]

function hashIndex(id = '') {
  return [...String(id)].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
}

function getAspectClass(id) {
  return ASPECT_CLASSES[hashIndex(id) % ASPECT_CLASSES.length]
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
  const aspectClass = getAspectClass(memory._id)
  const nostalgic = isOldMemory(memory.memoryDate) || hashIndex(memory._id) % 4 === 0
  const likeCount = memory.likesCount ?? memory.likes?.length ?? 0
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
        className="group relative mb-4 break-inside-avoid cursor-pointer w-full"
        onClick={openModal}
      >
        <div
          className={`relative w-full overflow-hidden rounded-2xl bg-stone-200 isolate shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(234,88,12,0.12)] transition-shadow duration-500 ${aspectClass} max-h-[min(300px,78vw)] sm:max-h-[22rem]`}
        >
          <img
            src={img}
            alt={memory.title || 'Memory'}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
              nostalgic
                ? 'grayscale-[0.85] contrast-[1.05] brightness-[0.92] sm:group-hover:grayscale-[0.15] sm:group-hover:brightness-100'
                : ''
            } ${hovered ? 'sm:scale-[1.03]' : ''}`}
          />

          {nostalgic && (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(28,25,23,0.3)_100%)] opacity-50 sm:group-hover:opacity-35 transition-opacity duration-500" />
          )}

          {/* Top: category badge — never overlaps bottom text */}
          {/* <div className="absolute top-0 left-0 right-0 z-20 p-2.5 pointer-events-none">
            <span className="inline-block max-w-[calc(100%-0.5rem)] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 text-stone-700 shadow-sm truncate">
              {eventLabel}
            </span>
          </div> */}

          {/* Desktop-only center hover actions */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="hidden sm:flex absolute inset-0 z-30 items-center justify-center gap-2 px-3"
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

          {/* Bottom: title + meta — dedicated gradient panel */}
          {/* <motion.div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
            <div className="bg-gradient-to-t from-black/95 via-black/75 to-transparent pt-12 pb-3 px-3 space-y-1.5">
              {memory.title && (
                <p className="text-sm font-semibold text-white line-clamp-2 leading-snug drop-shadow-sm">
                  {memory.title}
                </p>
              )}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-white/30 shrink-0 bg-stone-300">
                  {author?.avatar ? (
                    <img src={author.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-orange-400 to-amber-600">
                      {author?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white truncate">{author?.name || 'Student'}</p>
                  <p className="text-[10px] text-white/70">{uploadedAt}</p>
                </div>
                <div className="flex items-center gap-1 text-white text-xs font-medium shrink-0">
                  <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-ember text-ember' : ''}`} />
                  <span>{likeCount}</span>
                </div>
              </div>
              {memory.description && (
                <p className="text-[11px] text-white/80 line-clamp-2 leading-relaxed">{memory.description}</p>
              )}
            </div>
          </motion.div> */}
        </div>
      </motion.article>

      {modalOpen && (
        <Suspense fallback={null}>
          <MemoryModal memoryId={memory._id} onClose={() => setModalOpen(false)} />
        </Suspense>
      )}
    </>
  )
}
