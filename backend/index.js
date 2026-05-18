import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { connectDB } from './config/db.js'
import { configureCloudinary } from './config/cloudinary.js'
import { verifyToken } from './utils/jwt.js'

import authRoutes from './routes/authRoutes.js'
import memoryRoutes from './routes/memoryRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import storyRoutes from './routes/storyRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import userRoutes from './routes/userRoutes.js'
import eventRoutes from './routes/eventRoutes.js'
import quoteRoutes from './routes/quoteRoutes.js'
import searchRoutes from './routes/searchRoutes.js'

const app = express()
const httpServer = createServer(app)

const origins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: origins,
    credentials: true,
  })
)
app.use(express.json({ limit: '2mb' }))

if (process.env.CLOUDINARY_CLOUD_NAME) {
  configureCloudinary()
}

/** Socket.io — real-time notifications per user room */
const io = new Server(httpServer, {
  cors: { origin: origins, credentials: true },
})

io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next()
  try {
    const { id } = verifyToken(token)
    socket.join(`user:${id}`)
  } catch {
    /* guest connection allowed */
  }
  next()
})

io.on('connection', (socket) => {
  socket.emit('connected', { ok: true })
})

app.set('io', io)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'IGIT Memories API' })
})

app.use('/api/auth', authRoutes)
app.use('/api/memories', memoryRoutes)
app.use('/api/memories/:memoryId/comments', commentRoutes)
app.use('/api/stories', storyRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/users', userRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/quotes', quoteRoutes)
app.use('/api/search', searchRoutes)

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err)
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message })
  }
  res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

const PORT = process.env.PORT || 5000

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`API + WebSocket listening on port ${PORT}`)
    })
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
