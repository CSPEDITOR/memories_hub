import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { StoriesBar } from '@/components/stories/StoriesBar.jsx'
import { GlassPanel } from '@/components/ui/GlassPanel.jsx'
import { fadeUp } from '@/animations/variants.js'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute.jsx'
import { useAuth } from '@/context/AuthContext.jsx'
import { useState } from 'react'
import { postStory } from '@/services/storyService.js'

function StoryComposer() {
  const { refreshUser } = useAuth()
  const [file, setFile] = useState(null)
  const [caption, setCaption] = useState('')
  const [musicUrl, setMusicUrl] = useState('')
  const [msg, setMsg] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!file) return
    const fd = new FormData()
    fd.append('media', file)
    fd.append('caption', caption)
    fd.append('musicUrl', musicUrl)
    try {
      await postStory(fd)
      setMsg('Story published for 24h ✨')
      setFile(null)
      setCaption('')
      setMusicUrl('')
      refreshUser()
    } catch (ex) {
      setMsg(ex.response?.data?.message || 'Upload failed')
    }
  }

  return (
    <GlassPanel className="p-6 space-y-4">
      <h2 className="font-display text-2xl text-stone-900 dark:text-parchment">Add your story</h2>
      {msg && <p className="text-sm text-gold-dim">{msg}</p>}
      <form className="space-y-3" onSubmit={submit}>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />
        <input
          className="w-full rounded-xl bg-white/70 dark:bg-white/5 border border-white/20 px-3 py-2 text-sm"
          placeholder="Caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <input
          className="w-full rounded-xl bg-white/70 dark:bg-white/5 border border-white/20 px-3 py-2 text-sm"
          placeholder="Optional music URL (.mp3)"
          value={musicUrl}
          onChange={(e) => setMusicUrl(e.target.value)}
        />
        <button type="submit" className="px-5 py-2 rounded-xl bg-gold/25 font-medium text-sm">
          Publish 24h story
        </button>
      </form>
    </GlassPanel>
  )
}

export function StoryOfDayPage() {
  return (
    <>
      <Helmet>
        <title>Story of the Day — IGIT Memories</title>
      </Helmet>
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-8">
        <header>
          <h1 className="font-display text-4xl text-stone-900 dark:text-parchment">Stories in the air</h1>
          <p className="text-stone-500 mt-2 max-w-2xl">
            Circular rings, soft progress bars, auto-advance — like reels, but softer. Stories expire after twenty-four hours.
          </p>
        </header>
        <StoriesBar />
        <ProtectedRoute>
          <StoryComposer />
        </ProtectedRoute>
      </motion.div>
    </>
  )
}
