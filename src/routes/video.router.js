import {Router} from 'express'
import {
    publishAVideo
} from '../controllers/video.controller.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
const router = Router()

router.route('/uplode-video').post(verifyToken, upload.fields([
    {
        name: 'videoFile',
        count:1
    },
    {
        name: 'thumbnail',
        count:1
    }
]), publishAVideo)

export default router