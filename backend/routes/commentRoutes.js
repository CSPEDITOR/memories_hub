import { Router } from 'express'
import { listComments, addComment, deleteComment } from '../controllers/commentController.js'
import { protect } from '../middleware/auth.js'

const router = Router({ mergeParams: true })

router.get('/', listComments)
router.post('/', protect, addComment)
router.delete('/:id', protect, deleteComment)

export default router
