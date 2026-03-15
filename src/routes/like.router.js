import express from 'express'
import {toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos} from '../controllers/like.controller.js'
import {verifyToken} from '../middlewares/auth.middleware.js'


const router = express.Router()

// Match frontend API calls
router.route('/toggle/v/:videoId').post(verifyToken, toggleVideoLike)
router.route('/toggle/c/:commentId').post(verifyToken, toggleCommentLike)
router.route('/toggle/t/:tweetId').post(verifyToken, toggleTweetLike)
router.route('/videos').get(verifyToken, getLikedVideos)

export default router