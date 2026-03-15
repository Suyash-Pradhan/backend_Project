import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from '../controllers/subscription.controller.js';

const router = express.Router();

// Match frontend API calls
router.route('/c/:channelId').post(verifyToken, toggleSubscription);
router.route('/c/:channelId').get(verifyToken, getUserChannelSubscribers);
router.route('/u/:subscriberId').get(verifyToken, getSubscribedChannels);
export default router;