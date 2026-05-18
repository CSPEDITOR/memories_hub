import { Router } from 'express'
import { listNotifications, unreadCount, markRead, markOneRead } from '../controllers/notificationController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.get('/', protect, listNotifications)
router.get('/unread-count', protect, unreadCount)
router.patch('/read-all', protect, markRead)
router.patch('/:id/read', protect, markOneRead)

export default router
