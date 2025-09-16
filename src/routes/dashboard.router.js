import express from 'express'
const router = express.Router()
import { verifyToken } from '../middlewares/auth.middleware.js'
import {
    getChannelStats,
    getChannelVideos
} from '../controllers/dashboard.controller.js'

router.route('/channel-stats/:channelId').get(verifyToken, getChannelStats)
router.route('/channel-videos/:channelId').get(verifyToken, getChannelVideos)

export default router