import { useState, useMemo, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Bookmark, Share2, Maximize2 } from 'lucide-react'
import { formatRelative } from '@/utils/formatDate.js'
import { useAuth } from '@/context/AuthContext.jsx'
import * as memoryService from '@/services/memoryService.js'

const MemoryModal = lazy(() => import('@/components/memories/MemoryModal.jsx'))

/** Masonry-friendly memory card with cinematic B→W reveal on hover */
export function MemoryCard({ memory, onUpdate, commentCount }) {
  const { isAuthenticated, user } = useAuth()
  const [isHovered, setIsHovered] = useState(false)
  const [modal, setModal] = useState(false)
  const userId = user?._id || user?.id

  const liked = useMemo(
    () => (memory.likes || []).some((id) => String(id) === String(userId)),
    [memory.likes, userId]
  )

  const author = memory.author
  const img = memory.images?.[0]
  const eventCategory = memory.event || 'Memory'

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

  const openModal = () => {
    setModal(true)
  }

  return (
    <>
      <motion.article
        layout
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-soft break-inside-avoid mb-4 border border-white/10 dark:border-white/5"
        onClick={openModal}
      >
        <div className="relative overflow-hidden w-full h-full bg-stone-900">
          <motion.img
            src={img}
            alt={memory.title || 'Memory Image'}
            loading="lazy"
            className="w-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 filter grayscale contrast-110 brightness-90 group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 transition-opacity duration-500 group-hover:opacity-80" />
          
          {/* Top floating badge */}
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-parchment border border-white/20 shadow-lg">
            {eventCategory}
          </span>

          {/* Floating Hover Actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-3 right-3 flex flex-col gap-2 z-10"
              >
                <button
                  type="button"
                  onClick={handleSave}
                  className="p-2.5 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all shadow-lg"
                  aria-label="Save"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard?.writeText(window.location.origin + '/memories#' + memory._id)
                  }}
                  className="p-2.5 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all shadow-lg"
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={openModal}
                  className="p-2.5 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all shadow-lg hidden sm:block"
                  aria-label="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Overlay Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 border border-white/30 backdrop-blur-sm shrink-0">
              {author?.avatar ? (
                <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br from-orange-400 to-amber-600">
                  {author?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate drop-shadow-md">
                {author?.name || 'Student'}
              </p>
              <p className="text-xs text-white/70 drop-shadow-md">
                {memory.memoryDate ? formatRelative(memory.memoryDate) : formatRelative(memory.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-white/90 text-sm font-medium pt-1">
            <button
              type="button"
              onClick={handleLike}
              className="flex items-center gap-1.5 hover:text-gold transition-colors"
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-gold text-gold' : ''}`} />
              <span>{memory.likesCount ?? memory.likes?.length ?? 0}</span>
            </button>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              <span>{commentCount ?? memory.comments?.length ?? 0}</span>
            </span>
          </div>
        </div>
      </motion.article>

      {modal && (
        <Suspense fallback={null}>
          <MemoryModal key={memory._id} memoryId={memory._id} onClose={() => setModal(false)} />
        </Suspense>
      )}
    </>
  )
}

