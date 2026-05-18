import { Router } from 'express'
import { getCategories, listEvents, createEvent } from '../controllers/eventController.js'
import { protect } from '../middleware/auth.js'

const router = Router()

router.get('/categories', getCategories)
router.get('/', listEvents)
router.post('/', protect, createEvent)

export default router
