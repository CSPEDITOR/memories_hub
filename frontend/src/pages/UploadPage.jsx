import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EVENT_CATEGORIES } from '@/utils/constants.js'
import { createMemory } from '@/services/memoryService.js'
import { fadeUp } from '@/animations/variants.js'

export function UploadPage() {
  const nav = useNavigate()
  const [files, setFiles] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [memoryDate, setMemoryDate] = useState('')
  const [eventCategory, setEventCategory] = useState(EVENT_CATEGORIES[0])
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!files.length) {
      setStatus('Please choose at least one image.')
      return
    }
    const fd = new FormData()
    files.forEach((f) => fd.append('images', f))
    fd.append('title', title)
    fd.append('description', description)
    fd.append('memoryDate', memoryDate)
    fd.append('eventCategory', eventCategory)
    fd.append('location', location)
    fd.append('tags', JSON.stringify(tags.split(',').map((t) => t.trim()).filter(Boolean)))
    try {
      await createMemory(fd)
      setStatus('Uploaded — your memory is live.')
      setTimeout(() => nav('/memories'), 900)
    } catch (ex) {
      setStatus(ex.response?.data?.message || 'Upload failed')
    }
  }

  return (
    <>
      <Helmet>
        <title>Upload — IGIT Memories</title>
      </Helmet>
      <motion.form
        variants={fadeUp}
        initial="hidden"
        animate="show"
        onSubmit={submit}
        className="max-w-2xl mx-auto glass rounded-3xl p-8 space-y-5"
      >
        <h1 className="font-display text-4xl text-stone-900 dark:text-parchment">Upload a memory</h1>
        <p className="text-sm text-stone-500">Images go to Cloudinary via the API (multer buffer upload).</p>
        {status && <p className="text-sm text-gold-dim">{status}</p>}
        <input type="file" accept="image/*" multiple onChange={(e) => setFiles([...e.target.files])} />
        <input
          className="w-full rounded-xl bg-white/70 dark:bg-white/5 border border-white/20 px-3 py-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full rounded-xl bg-white/70 dark:bg-white/5 border border-white/20 px-3 py-2 min-h-[120px]"
          placeholder="Story / description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gold-dim uppercase tracking-widest">Original memory date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-xl bg-white/70 dark:bg-white/5 border border-white/20 px-3 py-2"
              value={memoryDate}
              onChange={(e) => setMemoryDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs text-gold-dim uppercase tracking-widest">Location</label>
            <input
              className="mt-1 w-full rounded-xl bg-white/70 dark:bg-white/5 border border-white/20 px-3 py-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-gold-dim uppercase tracking-widest">Event category</label>
          <select
            className="mt-1 w-full rounded-xl bg-white/70 dark:bg-white/5 border border-white/20 px-3 py-2"
            value={eventCategory}
            onChange={(e) => setEventCategory(e.target.value)}
          >
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <input
          className="w-full rounded-xl bg-white/70 dark:bg-white/5 border border-white/20 px-3 py-2"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-gold to-ember text-night font-semibold shadow-glow">
          Publish memory
        </button>
      </motion.form>
    </>
  )
}
