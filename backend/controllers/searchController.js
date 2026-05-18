import Memory from '../models/Memory.js'
import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const globalSearch = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim()
  if (!q) return res.json({ memories: [], users: [] })
  const [memories, users] = await Promise.all([
    Memory.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .populate('author', 'name avatar')
      .lean(),
    User.find({ $text: { $search: q } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(10)
      .select('name avatar department passoutYear')
      .lean(),
  ])
  res.json({ memories, users })
})
