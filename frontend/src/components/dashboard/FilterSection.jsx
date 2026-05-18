import { motion } from 'framer-motion'
import { DASHBOARD_FILTERS } from '@/utils/dashboardFilters.js'

const PASTEL_STYLES = [
  'bg-orange-50 text-orange-900 border-orange-100 hover:bg-orange-100',
  'bg-amber-50 text-amber-900 border-amber-100 hover:bg-amber-100',
  'bg-rose-50 text-rose-900 border-rose-100 hover:bg-rose-100',
  'bg-sky-50 text-sky-900 border-sky-100 hover:bg-sky-100',
  'bg-violet-50 text-violet-900 border-violet-100 hover:bg-violet-100',
  'bg-teal-50 text-teal-900 border-teal-100 hover:bg-teal-100',
  'bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200',
]

export function FilterSection({ activeFilter = 'All', onFilterChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-[4.5rem] z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-2 bg-white/90 dark:bg-stone-950/90 backdrop-blur-xl border-b border-stone-100 dark:border-white/5"
    >
      <motion.div
        className="flex gap-2 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory scroll-smooth touch-pan-x"
        role="tablist"
        aria-label="Memory categories"
      >
        {DASHBOARD_FILTERS.map((filter, i) => {
          const isActive = activeFilter === filter
          const pastel = PASTEL_STYLES[i % PASTEL_STYLES.length]

          return (
            <button
              key={filter}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onFilterChange?.(filter)}
              className={`snap-start shrink-0 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 relative min-h-[44px] ${
                isActive
                  ? 'text-white border-transparent shadow-[0_4px_20px_rgba(234,88,12,0.35)]'
                  : `${pastel} dark:bg-white/5 dark:text-stone-200 dark:border-white/10`
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="dashboardFilterPill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-ember to-orange-500"
                  style={{ zIndex: 0 }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.55 }}
                />
              )}
              <span className="relative z-10">{filter}</span>
            </button>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
