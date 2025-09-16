import { Router } from 'express'
import {
    publishAVideo, getVideoById, updateVideo, getAllVideos, deleteVideo, togglePublishStatus, recordView
} from '../controllers/video.controller.js'
import { upload } from '../middlewares/multer.middleware.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
const router = Router()

router.route('/uplode-video').post(verifyToken, upload.fields([
    {
        name: 'videoFile',
        count: 1
    },
    {
        name: 'thumbnail',
        count: 1
    }
]), publishAVideo)

router.route('/getvideo/:videoId').get(verifyToken, getVideoById)
router.route('/update-video/:videoId').patch(verifyToken, upload.single('thumbnail'), updateVideo)
router.route('/videos').get(getAllVideos)
router.route('/delete-video/:videoId').delete(verifyToken, deleteVideo)
router.route('/toggle-video-status/:videoId').delete(verifyToken, togglePublishStatus)
router.route('/add-view/:videoId').get(recordView)


export default router