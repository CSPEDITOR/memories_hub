import Memory from '../models/Memory.js'
import Event from '../models/Event.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { EVENT_CATEGORIES } from '../utils/eventCategories.js'

/** Categories with memory counts for Events page */
export const getCategories = asyncHandler(async (_req, res) => {
  const counts = await Memory.aggregate([{ $group: { _id: '$eventCategory', count: { $sum: 1 } } }])
  const map = Object.fromEntries(counts.map((c) => [c._id, c.count]))
  const categories = EVENT_CATEGORIES.map((name) => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    count: map[name] || 0,
  }))
  res.json(categories)
})

/** Optional DB-backed featured events */
export const listEvents = asyncHandler(async (_req, res) => {
  const events = await Event.find().sort({ date: -1 }).limit(50).lean()
  res.json(events)
})

export const createEvent = asyncHandler(async (req, res) => {
  const { title, slug, category, description, date } = req.body
  if (!title || !slug || !category) {
    return res.status(400).json({ message: 'title, slug, category required' })
  }
  const event = await Event.create({
    title,
    slug,
    category,
    description,
    date: date ? new Date(date) : undefined,
    createdBy: req.userId,
  })
  res.status(201).json(event)
})
