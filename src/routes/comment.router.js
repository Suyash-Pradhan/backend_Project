import express from 'express'
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from '../controllers/comment.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Match frontend API calls: /api/v1/comments/:videoId
router.route('/:videoId').get(getVideoComments)
router.route('/:videoId').post(verifyToken, addComment)
router.route('/c/:commentId').patch(verifyToken, updateComment)
router.route('/c/:commentId').delete(verifyToken, deleteComment)

export default router
