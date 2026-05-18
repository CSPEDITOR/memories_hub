import { Router } from 'express'
import {
  getProfile,
  updateMe,
  followUser,
  savedMemories,
  userGallery,
} from '../controllers/userController.js'
import { protect } from '../middleware/auth.js'
import { singleImageUpload } from '../middleware/upload.js'

const router = Router()

router.get('/me/saved', protect, savedMemories)
router.patch('/me', protect, singleImageUpload.single('avatar'), updateMe)
router.get('/:id/gallery', userGallery)
router.get('/:id', getProfile)
router.post('/:id/follow', protect, followUser)

export default router
