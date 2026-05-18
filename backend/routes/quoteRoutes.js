import { Router } from 'express'
import { getNostalgicQuote, listCurated } from '../controllers/quoteController.js'

const router = Router()

router.get('/nostalgic', getNostalgicQuote)
router.get('/curated', listCurated)

export default router
