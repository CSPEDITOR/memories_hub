import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInfiniteMemories } from '@/hooks/useInfiniteMemories.js'
import { MemoryMasonry } from '@/components/memories/MemoryMasonry.jsx'
import { GridSkeleton } from '@/components/ui/Skeleton.jsx'
import { fadeUp } from '@/animations/variants.js'

export function MemoriesPage() {
  const [params] = useSearchParams()
  const category = params.get('category') || undefined
  const { items, loading, error, hasMore, sentinelRef, patchMemory } = useInfiniteMemories({ category })

  return (
    <>
      <Helmet>
        <title>Memories — IGIT Memories</title>
      </Helmet>
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
        <header>
          <h1 className="font-display text-4xl text-stone-900 dark:text-parchment">Every frame has a heartbeat</h1>
          {category && <p className="text-gold-dim text-sm mt-2 uppercase tracking-widest">Filtered · {category}</p>}
        </header>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {loading && !items.length ? <GridSkeleton /> : <MemoryMasonry items={items} onMemoryUpdate={patchMemory} />}
        <div ref={sentinelRef} className="h-8 text-center text-xs text-stone-500">
          {loading && items.length ? 'Loading…' : !hasMore && items.length ? 'End of the reel.' : ''}
        </div>
      </motion.div>
    </>
  )
}
