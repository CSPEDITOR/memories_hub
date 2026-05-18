import Memory from '../models/Memory.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js'
import { EVENT_CATEGORIES } from '../utils/eventCategories.js'

const populateAuthor = { path: 'author', select: 'name avatar department passoutYear' }

function notify(io, userId, payload) {
  if (io && userId) io.to(`user:${userId}`).emit('notification', payload)
}

export const listMemories = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1)
  const limit = Math.min(24, Math.max(1, parseInt(req.query.limit, 10) || 12))
  const skip = (page - 1) * limit
  const { category, sort = 'recent', search } = req.query
  const filter = {}
  if (category) filter.eventCategory = category
  if (search) {
    filter.$text = { $search: search }
  }
  let sortObj = { createdAt: -1 }
  if (sort === 'trending' || sort === 'likes') {
    sortObj = { likesCount: -1, createdAt: -1 }
  }
  const [items, total] = await Promise.all([
    Memory.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate(populateAuthor)
      .lean(),
    Memory.countDocuments(filter),
  ])
  res.json({ items, page, limit, total, hasMore: skip + items.length < total })
})

export const getMemory = asyncHandler(async (req, res) => {
  const memory = await Memory.findById(req.params.id).populate(populateAuthor).lean()
  if (!memory) return res.status(404).json({ message: 'Memory not found' })
  res.json(memory)
})

export const createMemory = asyncHandler(async (req, res) => {
  const files = req.files || []
  if (!files.length) {
    return res.status(400).json({ message: 'At least one image is required' })
  }
  const { title, description, memoryDate, eventCategory, location, tags } = req.body
  if (!title || !memoryDate || !eventCategory) {
    return res.status(400).json({ message: 'title, memoryDate, and eventCategory are required' })
  }
  if (!EVENT_CATEGORIES.includes(eventCategory)) {
    return res.status(400).json({ message: 'Invalid event category', allowed: EVENT_CATEGORIES })
  }
  const urls = []
  const ids = []
  for (const file of files) {
    const { url, public_id } = await uploadBufferToCloudinary(file.buffer)
    urls.push(url)
    ids.push(public_id)
  }
  let tagList = []
  if (tags) {
    try {
      tagList = Array.isArray(tags) ? tags : JSON.parse(tags)
    } catch {
      tagList = String(tags)
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    }
  }
  const memory = await Memory.create({
    author: req.userId,
    title,
    description: description || '',
    images: urls,
    cloudinaryIds: ids,
    tags: tagList,
    memoryDate: new Date(memoryDate),
    eventCategory,
    location: location || '',
  })
  const populated = await Memory.findById(memory._id).populate(populateAuthor)
  res.status(201).json(populated)
})

export const deleteMemory = asyncHandler(async (req, res) => {
  const memory = await Memory.findById(req.params.id)
  if (!memory) return res.status(404).json({ message: 'Not found' })
  if (memory.author.toString() !== req.userId) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  await memory.deleteOne()
  res.json({ message: 'Deleted' })
})

export const likeMemory = asyncHandler(async (req, res) => {
  const memory = await Memory.findById(req.params.id)
  if (!memory) return res.status(404).json({ message: 'Not found' })
  const uid = req.userId
  const idx = memory.likes.map(String).indexOf(uid)
  const io = req.app.get('io')
  if (idx === -1) {
    memory.likes.push(uid)
    memory.likesCount = memory.likes.length
    await memory.save()
    if (memory.author.toString() !== uid) {
      const actor = await User.findById(uid).select('name')
      await Notification.create({
        recipient: memory.author,
        actor: uid,
        type: 'like',
        message: `${actor?.name || 'Someone'} liked your memory`,
        memory: memory._id,
      })
      notify(io, memory.author.toString(), { type: 'like', memoryId: memory._id })
    }
  } else {
    memory.likes.splice(idx, 1)
    memory.likesCount = memory.likes.length
    await memory.save()
  }
  const updated = await Memory.findById(memory._id).populate(populateAuthor)
  res.json(updated)
})

export const saveMemory = asyncHandler(async (req, res) => {
  const memory = await Memory.findById(req.params.id)
  if (!memory) return res.status(404).json({ message: 'Not found' })
  const user = await User.findById(req.userId)
  const mid = memory._id.toString()
  const saved = user.savedMemories.map(String).includes(mid)
  if (saved) {
    user.savedMemories = user.savedMemories.filter((id) => id.toString() !== mid)
    memory.saves = memory.saves.filter((id) => id.toString() !== req.userId)
  } else {
    user.savedMemories.push(memory._id)
    if (!memory.saves.map(String).includes(req.userId)) memory.saves.push(req.userId)
  }
  await Promise.all([user.save(), memory.save()])
  res.json({ saved: !saved, savesCount: memory.saves.length })
})

export const incrementView = asyncHandler(async (req, res) => {
  const memory = await Memory.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }, { new: true })
  if (!memory) return res.status(404).json({ message: 'Not found' })
  res.json({ viewCount: memory.viewCount })
})

export const trending = asyncHandler(async (_req, res) => {
  const items = await Memory.find()
    .sort({ likesCount: -1, viewCount: -1, createdAt: -1 })
    .limit(8)
    .populate(populateAuthor)
    .lean()
  res.json(items)
})

export const randomFeed = asyncHandler(async (_req, res) => {
  const total = await Memory.countDocuments()
  if (!total) return res.json([])
  const size = Math.min(12, total)
  const sampled = await Memory.aggregate([{ $sample: { size } }])
  const ids = sampled.map((r) => r._id)
  const items = await Memory.find({ _id: { $in: ids } }).populate(populateAuthor).lean()
  res.json(items)
})

export const relatedMemories = asyncHandler(async (req, res) => {
  const m = await Memory.findById(req.params.id)
  if (!m) return res.status(404).json({ message: 'Not found' })
  const items = await Memory.find({
    _id: { $ne: m._id },
    $or: [{ eventCategory: m.eventCategory }, { author: m.author }],
  })
    .limit(8)
    .populate(populateAuthor)
    .lean()
  res.json(items)
})
