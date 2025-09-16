import express from 'express'
import {toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos} from '../controllers/like.controller.js'
import {verifyToken} from '../middlewares/auth.middleware.js'


const router = express.Router()

router.route('/like-video/:videoId').post(verifyToken, toggleVideoLike)
router.route('/like-comment/:commentId').post(verifyToken, toggleCommentLike)
router.route('/like-tweet/:tweetId').post(verifyToken, toggleTweetLike)
router.route('/all-liked-videos').get(verifyToken, getLikedVideos)

export default router