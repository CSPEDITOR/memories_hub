import { verifyToken } from '../utils/jwt.js'

/**
 * JWT guard — attaches req.userId from Bearer token.
 */
export function protect(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' })
  }
  try {
    const decoded = verifyToken(token)
    req.userId = decoded.id
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

/**
 * Optional auth — sets req.userId if valid token present.
 */
export function optionalAuth(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next()
  try {
    const decoded = verifyToken(token)
    req.userId = decoded.id
  } catch {
    /* ignore */
  }
  next()
}
