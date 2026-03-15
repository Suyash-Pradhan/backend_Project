import { Router } from 'express'
import {
    publishAVideo, getVideoById, updateVideo, getAllVideos, deleteVideo, togglePublishStatus, recordView, getMyVideos
} from '../controllers/video.controller.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
const router = Router()

// Public routes
router.route('/').get(getAllVideos)
router.route('/mine').get(verifyToken, getMyVideos)
router.route('/view/:videoId').post(recordView)
router.route('/:videoId').get(getVideoById)

// Protected routes
router.route('/').post(verifyToken, upload.fields([
    {
        name: 'videoFile',
        maxCount: 1
    },
    {
        name: 'thumbnail',
        maxCount: 1
    }
]), publishAVideo)

router.route('/:videoId').patch(verifyToken, upload.single('thumbnail'), updateVideo)
router.route('/:videoId').delete(verifyToken, deleteVideo)
router.route('/toggle/publish/:videoId').patch(verifyToken, togglePublishStatus)


export default router