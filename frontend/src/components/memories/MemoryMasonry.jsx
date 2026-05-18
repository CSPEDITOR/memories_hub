import Masonry from 'react-masonry-css'
import { MasonryMemoryCard } from '@/components/memories/MasonryMemoryCard.jsx'

/** Pinterest-style responsive masonry: 5 / 4 / 3 / 2 columns */
const breakpointCols = {
  default: 5,
  1280: 4,
  1024: 3,
  640: 2,
}

export function MemoryMasonry({ items, onMemoryUpdate }) {
  return (
    <Masonry
      breakpointCols={breakpointCols}
      className="flex -ml-3 w-auto"
      columnClassName="pl-3 bg-clip-padding"
    >
      {items.map((m, index) => (
        <MasonryMemoryCard
          key={m._id}
          memory={m}
          index={index}
          onUpdate={onMemoryUpdate}
          commentCount={m.commentCount ?? m.comments?.length ?? 0}
        />
      ))}
    </Masonry>
  )
}
