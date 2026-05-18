import Notification from '../models/Notification.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ recipient: req.userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('actor', 'name avatar')
    .populate('memory', 'title images')
    .lean()
  res.json(items)
})

export const unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ recipient: req.userId, read: false })
  res.json({ count })
})

export const markRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.userId, read: false },
    { $set: { read: true } }
  )
  res.json({ ok: true })
})

export const markOneRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOne({ _id: req.params.id, recipient: req.userId })
  if (!n) return res.status(404).json({ message: 'Not found' })
  n.read = true
  await n.save()
  res.json(n)
})
