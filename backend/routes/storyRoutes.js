import { Router } from 'express'
import { listActiveStories, createStory, viewStory } from '../controllers/storyController.js'
import { protect } from '../middleware/auth.js'
import { singleImageUpload } from '../middleware/upload.js'

const router = Router()

router.get('/', listActiveStories)
router.post('/', protect, singleImageUpload.single('media'), createStory)
router.post('/:id/view', protect, viewStory)

export default router
