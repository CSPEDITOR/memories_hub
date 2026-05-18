import Story from '../models/Story.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js'

const STORY_TTL_MS = 24 * 60 * 60 * 1000

const populateAuthor = { path: 'author', select: 'name avatar' }

export const listActiveStories = asyncHandler(async (_req, res) => {
  const now = new Date()
  const stories = await Story.find({ expiresAt: { $gt: now } })
    .sort({ createdAt: -1 })
    .populate(populateAuthor)
    .lean()
  /** Group by author for Instagram-style rings */
  const byUser = {}
  for (const s of stories) {
    const id = s.author._id.toString()
    if (!byUser[id]) byUser[id] = { author: s.author, stories: [] }
    byUser[id].stories.push(s)
  }
  res.json(Object.values(byUser))
})

export const createStory = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) {
    return res.status(400).json({ message: 'Image file required' })
  }
  const { caption, musicUrl } = req.body
  const { url } = await uploadBufferToCloudinary(req.file.buffer, { folder: 'igit-memories/stories' })
  const expiresAt = new Date(Date.now() + STORY_TTL_MS)
  const story = await Story.create({
    author: req.userId,
    mediaUrl: url,
    mediaType: 'image',
    caption: caption || '',
    musicUrl: musicUrl || '',
    expiresAt,
  })
  const populated = await Story.findById(story._id).populate(populateAuthor)
  res.status(201).json(populated)
})

export const viewStory = asyncHandler(async (req, res) => {
  const story = await Story.findById(req.params.id)
  if (!story || story.expiresAt < new Date()) {
    return res.status(404).json({ message: 'Story expired or not found' })
  }
  if (!story.views.map(String).includes(req.userId)) {
    story.views.push(req.userId)
    await story.save()
  }
  res.json({ ok: true })
})
