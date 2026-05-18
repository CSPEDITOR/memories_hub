import Masonry from 'react-masonry-css'

const SKELETON_HEIGHTS = ['h-52', 'h-72', 'h-64', 'h-96', 'h-80', 'h-60', 'h-[22rem]', 'h-48']

const breakpointCols = {
  default: 5,
  1280: 4,
  1024: 3,
  640: 2,
}

/** Single card skeleton (legacy) */
export function MemoryCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden mb-4 animate-pulse">
      <div className="h-72 bg-stone-200/70 dark:bg-stone-700/50 rounded-2xl" />
    </div>
  )
}

/** Pinterest-style masonry loading placeholders */
export function MasonryGridSkeleton({ count = 12 }) {
  return (
    <Masonry breakpointCols={breakpointCols} className="flex -ml-3 w-auto" columnClassName="pl-3 bg-clip-padding">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`relative mb-4 rounded-2xl overflow-hidden animate-pulse ${SKELETON_HEIGHTS[i % SKELETON_HEIGHTS.length]}`}
        >
          <div className="h-full w-full bg-gradient-to-b from-stone-200 via-stone-100 to-stone-200 dark:from-stone-800 dark:via-stone-900 dark:to-stone-800" />
          <div className="absolute bottom-3 left-3 right-3 space-y-2">
            <div className="h-3 w-2/3 rounded-full bg-stone-300/70 dark:bg-stone-600/50" />
            <div className="h-2.5 w-1/2 rounded-full bg-stone-200/90 dark:bg-stone-700/50" />
          </div>
        </div>
      ))}
    </Masonry>
  )
}

/** @deprecated Use MasonryGridSkeleton */
export function GridSkeleton({ count = 12 }) {
  return <MasonryGridSkeleton count={count} />
}
