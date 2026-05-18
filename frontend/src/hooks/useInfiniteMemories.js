import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchMemories } from '@/services/memoryService.js'

function matchesTag(memory, tag) {
  if (!tag) return true
  const needle = tag.toLowerCase()
  const tags = (memory.tags || []).map((t) => String(t).toLowerCase())
  const blob = [memory.title, memory.description, memory.location, ...tags]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return tags.some((t) => t.includes(needle)) || blob.includes(needle)
}

/** Infinite scroll for dashboard / memories list */
export function useInfiniteMemories({ category, tag, sort = 'recent', search } = {}) {
  const [items, setItems] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const sentinelRef = useRef(null)
  const loadingRef = useRef(false)
  const pageRef = useRef(1)

  const reset = useCallback(async () => {
    setLoading(true)
    setError(null)
    pageRef.current = 1
    setHasMore(true)
    loadingRef.current = true
    try {
      const res = await fetchMemories({ page: 1, limit: 12, category, sort, search })
      setItems(res.items || [])
      setHasMore(res.hasMore)
    } catch (e) {
      setError(e?.message || 'Failed to load')
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [category, tag, sort, search])

  useEffect(() => {
    reset()
  }, [reset])

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const next = pageRef.current + 1
      const res = await fetchMemories({ page: next, limit: 12, category, sort, search })
      setItems((prev) => [...prev, ...(res.items || [])])
      setHasMore(res.hasMore)
      pageRef.current = next
    } catch (e) {
      setError(e?.message || 'Failed to load more')
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [hasMore, category, tag, sort, search])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '240px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMore, items.length, hasMore])

  const patchMemory = useCallback((updated) => {
    setItems((prev) => prev.map((m) => (m._id === updated._id ? { ...m, ...updated } : m)))
  }, [])

  const filteredItems = useMemo(
    () => (tag ? items.filter((m) => matchesTag(m, tag)) : items),
    [items, tag]
  )

  return { items: filteredItems, loading, error, hasMore, reset, sentinelRef, patchMemory }
}
