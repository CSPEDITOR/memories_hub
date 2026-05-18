import User from '../models/User.js'
import Memory from '../models/Memory.js'
import Notification from '../models/Notification.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js'

const publicFields = 'name email avatar passoutYear department bio createdAt followers following'

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(publicFields).populate('followers', 'name avatar').populate('following', 'name avatar').lean()
  if (!user) return res.status(404).json({ message: 'User not found' })
  const [uploadCount, likesAgg] = await Promise.all([
    Memory.countDocuments({ author: user._id }),
    Memory.aggregate([
      { $match: { author: user._id } },
      { $project: { c: { $size: '$likes' } } },
      { $group: { _id: null, total: { $sum: '$c' } } },
    ]),
  ])
  const totalLikes = likesAgg[0]?.total || 0
  res.json({ ...user, stats: { uploadCount, totalLikes, followers: user.followers?.length || 0, following: user.following?.length || 0 } })
})

export const updateMe = asyncHandler(async (req, res) => {
  const { name, passoutYear, department, bio } = req.body
  const user = await User.findById(req.userId)
  if (!user) return res.status(404).json({ message: 'Not found' })
  if (name) user.name = name
  if (passoutYear !== undefined) user.passoutYear = passoutYear ? Number(passoutYear) : undefined
  if (department !== undefined) user.department = department
  if (bio !== undefined) user.bio = bio
  if (req.file?.buffer) {
    const { url } = await uploadBufferToCloudinary(req.file.buffer, { folder: 'igit-memories/avatars' })
    user.avatar = url
  }
  await user.save()
  const safe = await User.findById(user._id).select(publicFields).lean()
  res.json(safe)
})

export const followUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id
  if (targetId === req.userId) {
    return res.status(400).json({ message: 'Cannot follow yourself' })
  }
  const [me, them] = await Promise.all([User.findById(req.userId), User.findById(targetId)])
  if (!them) return res.status(404).json({ message: 'User not found' })
  const following = me.following.map(String).includes(targetId)
  if (following) {
    me.following = me.following.filter((id) => id.toString() !== targetId)
    them.followers = them.followers.filter((id) => id.toString() !== req.userId)
  } else {
    me.following.push(them._id)
    them.followers.push(me._id)
    await Notification.create({
      recipient: them._id,
      actor: me._id,
      type: 'follow',
      message: `${me.name} started following you`,
    })
    const io = req.app.get('io')
    io?.to(`user:${them._id}`).emit('notification', { type: 'follow' })
  }
  await Promise.all([me.save(), them.save()])
  res.json({ following: !following })
})

export const savedMemories = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).populate({
    path: 'savedMemories',
    populate: { path: 'author', select: 'name avatar' },
  })
  res.json(user.savedMemories || [])
})

export const userGallery = asyncHandler(async (req, res) => {
  const memories = await Memory.find({ author: req.params.id })
    .sort({ createdAt: -1 })
    .populate('author', 'name avatar')
    .lean()
  res.json(memories)
})
