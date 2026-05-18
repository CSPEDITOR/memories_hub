import Comment from '../models/Comment.js'
import Memory from '../models/Memory.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { asyncHandler } from '../utils/asyncHandler.js'

function notify(io, userId, payload) {
  if (io && userId) io.to(`user:${userId}`).emit('notification', payload)
}

export const listComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ memory: req.params.memoryId })
    .sort({ createdAt: -1 })
    .populate('author', 'name avatar')
    .lean()
  res.json(comments)
})

export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body
  if (!text?.trim()) return res.status(400).json({ message: 'Comment text required' })
  const memory = await Memory.findById(req.params.memoryId)
  if (!memory) return res.status(404).json({ message: 'Memory not found' })
  const comment = await Comment.create({
    memory: memory._id,
    author: req.userId,
    text: text.trim(),
  })
  if (memory.author.toString() !== req.userId) {
    const actor = await User.findById(req.userId).select('name')
    await Notification.create({
      recipient: memory.author,
      actor: req.userId,
      type: 'comment',
      message: `${actor?.name || 'Someone'} commented on your memory`,
      memory: memory._id,
    })
    const io = req.app.get('io')
    notify(io, memory.author.toString(), { type: 'comment', memoryId: memory._id })
  }
  const populated = await Comment.findById(comment._id).populate('author', 'name avatar')
  res.status(201).json(populated)
})

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id)
  if (!comment) return res.status(404).json({ message: 'Not found' })
  if (comment.author.toString() !== req.userId) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  await comment.deleteOne()
  res.json({ message: 'Deleted' })
})
