import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useInfiniteMemories } from '@/hooks/useInfiniteMemories.js'
import { MemoryMasonry } from '@/components/memories/MemoryMasonry.jsx'
import { FilterSection } from '@/components/dashboard/FilterSection.jsx'
import { MasonryGridSkeleton } from '@/components/ui/Skeleton.jsx'
import { getFilterQuery } from '@/utils/dashboardFilters.js'
import { fadeUp } from '@/animations/variants.js'

export function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const { category, tag } = getFilterQuery(activeFilter)
  const { items, loading, error, hasMore, sentinelRef, patchMemory } = useInfiniteMemories({
    category,
    tag,
    sort: 'recent',
  })

  return (
    <>
      <Helmet>
        <title>Dashboard — IGIT Memories</title>
      </Helmet>

      <div className="dashboard-feed -mx-4 sm:-mx-6 min-h-[calc(100vh-6rem)] bg-white dark:bg-stone-950 rounded-t-3xl overflow-hidden">
        <motion.header
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="px-4 sm:px-6 pt-2 pb-1"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember/80 mb-1">IGIT Memories</p>
          <h1 className="font-display text-3xl sm:text-4xl text-stone-900 dark:text-parchment tracking-tight">
            Your college storyboard
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 max-w-lg">
            Scroll through moments — farewells, hostel nights, trips, and everything in between.
          </p>
        </motion.header>

        <FilterSection activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="px-4 sm:px-6 pb-16"
        >
          {error && (
            <p className="text-red-500 text-sm mb-4 px-1" role="alert">
              {error}
            </p>
          )}

          {loading && !items.length ? (
            <MasonryGridSkeleton />
          ) : items.length === 0 && !loading ? (
            <motion.div className="py-24 text-center">
              <p className="font-display text-2xl text-stone-800 dark:text-parchment">No memories yet</p>
              <p className="text-stone-500 text-sm mt-2">Try another filter or upload the first moment.</p>
            </motion.div>
          ) : (
            <MemoryMasonry items={items} onMemoryUpdate={patchMemory} />
          )}

          <motion.div
            ref={sentinelRef}
            className="h-14 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {loading && items.length > 0 && (
              <span className="text-xs text-stone-400 animate-pulse">Loading more memories…</span>
            )}
            {!loading && !hasMore && items.length > 0 && (
              <span className="text-xs text-stone-400">You&apos;ve seen it all — for now.</span>
            )}
          </motion.div>
        </motion.section>
      </div>
    </>
  )
}
