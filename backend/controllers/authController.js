import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { signToken } from '../utils/jwt.js'
import { asyncHandler } from '../utils/asyncHandler.js'

function isAllowedStudentEmail(email) {
  const domain = process.env.STUDENT_EMAIL_DOMAIN?.trim()
  if (!domain) return true
  return email.toLowerCase().endsWith(`@${domain.toLowerCase()}`)
}

const userSafe = 'name email avatar passoutYear department bio collegeId createdAt followers following'

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, passoutYear, department } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' })
  }
  if (!isAllowedStudentEmail(email)) {
    return res.status(403).json({
      message: `Registration is restricted to IGIT students (@${process.env.STUDENT_EMAIL_DOMAIN})`,
    })
  }
  const exists = await User.findOne({ email })
  if (exists) {
    return res.status(400).json({ message: 'Email already registered' })
  }
  const hashed = await bcrypt.hash(password, 10)
  const user = await User.create({
    name,
    email,
    password: hashed,
    passoutYear: passoutYear ? Number(passoutYear) : undefined,
    department: department || '',
  })
  const token = signToken({ id: user._id.toString() })
  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      passoutYear: user.passoutYear,
      department: user.department,
      bio: user.bio,
    },
  })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' })
  }
  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }
  const token = signToken({ id: user._id.toString() })
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      passoutYear: user.passoutYear,
      department: user.department,
      bio: user.bio,
    },
  })
})

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select(userSafe).populate('followers', 'name avatar').populate('following', 'name avatar')
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
})
