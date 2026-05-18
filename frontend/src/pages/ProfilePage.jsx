import { Helmet } from 'react-helmet-async'
import { useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext.jsx'
import * as userService from '@/services/userService.js'
import { fadeUp } from '@/animations/variants.js'
import Masonry from 'react-masonry-css'
import { MemoryCard } from '@/components/memories/MemoryCard.jsx'

const breakpoints = { default: 3, 1024: 2, 640: 1 }

export function ProfilePage() {
  const { id } = useParams()
  const { user: me, isAuthenticated } = useAuth()
  const myId = me?._id || me?.id
  const [profile, setProfile] = useState(null)
  const [gallery, setGallery] = useState([])

  useEffect(() => {
    if (!id) return
    let c = false
    ;(async () => {
      try {
        const [p, g] = await Promise.all([userService.fetchProfile(id), userService.fetchGallery(id)])
        if (!c) {
          setProfile(p)
          setGallery(g)
        }
      } catch {
        if (!c) setProfile(null)
      }
    })()
    return () => {
      c = true
    }
  }, [id])

  const follow = async () => {
    if (!isAuthenticated || !id) return
    await userService.followUser(id)
    const p = await userService.fetchProfile(id)
    setProfile(p)
  }

  if (!id) {
    if (!myId) return <Navigate to="/login" replace />
    return <Navigate to={`/profile/${myId}`} replace />
  }

  if (!profile) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-stone-500">
        Loading profile…
      </div>
    )
  }

  const isMe = String(id) === String(myId)

  return (
    <>
      <Helmet>
        <title>{profile.name} — IGIT Memories</title>
      </Helmet>
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-10">
        <div className="glass rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-start">
          <img
            src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name)}`}
            alt=""
            className="w-32 h-32 rounded-full object-cover border-4 border-gold/30 shadow-glow"
          />
          <div className="flex-1 space-y-3">
            <h1 className="font-display text-4xl text-stone-900 dark:text-parchment">{profile.name}</h1>
            <p className="text-sm text-stone-500">{profile.email}</p>
            <p className="text-sm text-stone-600 dark:text-stone-300">
              {profile.department} · Passout {profile.passoutYear || '—'}
            </p>
            <p className="text-stone-700 dark:text-stone-200 max-w-xl">{profile.bio}</p>
            <div className="flex gap-6 text-sm">
              <span>
                <strong>{profile.stats?.followers}</strong> followers
              </span>
              <span>
                <strong>{profile.stats?.following}</strong> following
              </span>
              <span>
                <strong>{profile.stats?.uploadCount}</strong> uploads
              </span>
              <span>
                <strong>{profile.stats?.totalLikes}</strong> likes received
              </span>
            </div>
            {!isMe && isAuthenticated && (
              <button type="button" onClick={follow} className="px-4 py-2 rounded-xl bg-gold/25 font-medium text-sm">
                Follow / Unfollow
              </button>
            )}
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="font-display text-2xl text-stone-900 dark:text-parchment">Personal gallery</h2>
          <Masonry breakpointCols={breakpoints} className="flex -ml-4 w-auto" columnClassName="pl-4 bg-clip-padding">
            {gallery.map((m) => (
              <MemoryCard key={m._id} memory={m} />
            ))}
          </Masonry>
        </section>
      </motion.div>
    </>
  )
}
