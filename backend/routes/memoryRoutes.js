import { Router } from 'express'
import {
  listMemories,
  getMemory,
  createMemory,
  deleteMemory,
  likeMemory,
  saveMemory,
  incrementView,
  trending,
  randomFeed,
  relatedMemories,
} from '../controllers/memoryController.js'
import { protect, optionalAuth } from '../middleware/auth.js'
import { memoryUpload } from '../middleware/upload.js'

const router = Router()

router.get('/', optionalAuth, listMemories)
router.get('/trending', trending)
router.get('/random', randomFeed)
router.get('/:id/related', relatedMemories)
router.get('/:id', optionalAuth, getMemory)
router.post('/', protect, memoryUpload.array('images', 12), createMemory)
router.delete('/:id', protect, deleteMemory)
router.post('/:id/like', protect, likeMemory)
router.post('/:id/save', protect, saveMemory)
router.post('/:id/view', incrementView)

export default router
