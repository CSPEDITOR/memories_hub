import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ImagePlus, Loader2, Upload, X } from 'lucide-react'
import { EVENT_CATEGORIES } from '@/utils/constants.js'
import { createMemory } from '@/services/memoryService.js'
import { fadeUp } from '@/animations/variants.js'

export function UploadPage() {
  const nav = useNavigate()
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [memoryDate, setMemoryDate] = useState('')
  const [eventCategory, setEventCategory] = useState(EVENT_CATEGORIES[0])
  const [location, setLocation] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState({ type: '', message: '' })

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [files])

  const onFilesChange = (e) => {
    const picked = [...(e.target.files || [])]
    setFiles(picked)
    setStatus({ type: '', message: '' })
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (uploading) return
    if (!files.length) {
      setStatus({ type: 'error', message: 'Please choose at least one image.' })
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

    setUploading(true)
    setProgress(0)
    setStatus({ type: 'uploading', message: 'Preparing upload…' })

    try {
      await createMemory(fd, {
        onUploadProgress: (pct) => {
          setProgress(pct)
          setStatus({
            type: 'uploading',
            message: pct < 100 ? `Uploading images… ${pct}%` : 'Processing on server…',
          })
        },
      })
      setProgress(100)
      setStatus({ type: 'success', message: 'Uploaded — your memory is live!' })
      setTimeout(() => nav('/'), 1200)
    } catch (ex) {
      setStatus({
        type: 'error',
        message: ex.response?.data?.message || 'Upload failed. Please try again.',
      })
    } finally {
      setUploading(false)
    }
  }

  const fieldClass =
    'w-full rounded-xl bg-white/70 dark:bg-white/5 border border-white/20 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed'

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
        className="relative max-w-2xl mx-auto glass rounded-3xl p-6 sm:p-8 space-y-5"
      >
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 rounded-3xl bg-parchment/80 dark:bg-night/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6"
              aria-live="polite"
              aria-busy="true"
            >
              <Loader2 className="w-12 h-12 text-ember animate-spin" />
              <p className="font-medium text-stone-800 dark:text-parchment text-center">
                {status.message || 'Uploading…'}
              </p>
              <div className="w-full max-w-xs h-2 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold to-ember rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(progress, 8)}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>
              <p className="text-xs text-stone-500">{progress}% complete</p>
            </motion.div>
          )}
        </AnimatePresence>

        <h1 className="font-display text-4xl text-stone-900 dark:text-parchment">Upload a memory</h1>
        <p className="text-sm text-stone-500">Add photos and publish to the gallery.</p>

        {status.message && status.type !== 'uploading' && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm flex items-center gap-2 ${
              status.type === 'error'
                ? 'text-red-600 dark:text-red-400'
                : status.type === 'success'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-gold-dim'
            }`}
            role="alert"
          >
            {status.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {status.message}
          </motion.p>
        )}

        <label
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 cursor-pointer transition-colors ${
            uploading
              ? 'border-stone-200 opacity-50 pointer-events-none'
              : 'border-stone-300 dark:border-white/20 hover:border-ember/50 hover:bg-white/30 dark:hover:bg-white/5'
          }`}
        >
          <ImagePlus className="w-10 h-10 text-ember/80" />
          <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
            Tap to choose images
          </span>
          <span className="text-xs text-stone-500">JPG, PNG — multiple allowed</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={onFilesChange}
            disabled={uploading}
          />
        </label>

        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {previews.map((src, i) => (
              <div key={src} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100">
                <img src={src} alt="" className="w-full h-full object-cover" />
                {!uploading && (
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <input
          className={fieldClass}
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={uploading}
        />
        <textarea
          className={`${fieldClass} min-h-[120px]`}
          placeholder="Story / description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={uploading}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gold-dim uppercase tracking-widest">Original memory date</label>
            <input
              type="date"
              className={`mt-1 ${fieldClass}`}
              value={memoryDate}
              onChange={(e) => setMemoryDate(e.target.value)}
              required
              disabled={uploading}
            />
          </div>
          <div>
            <label className="text-xs text-gold-dim uppercase tracking-widest">Location</label>
            <input
              className={`mt-1 ${fieldClass}`}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={uploading}
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-gold-dim uppercase tracking-widest">Event category</label>
          <select
            className={`mt-1 ${fieldClass}`}
            value={eventCategory}
            onChange={(e) => setEventCategory(e.target.value)}
            disabled={uploading}
          >
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <input
          className={fieldClass}
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={uploading}
        />
        <button
          type="submit"
          disabled={uploading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-gold to-ember text-night font-semibold shadow-glow disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Publish memory
            </>
          )}
        </button>
      </motion.form>
    </>
  )
}
