import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from '../controllers/subscription.model.js';

const router = express.Router();

router.route('/toggle-subscription/:channelId').post(verifyToken, toggleSubscription);
router.route('/subscribers/:channelId').get(verifyToken, getUserChannelSubscribers);
router.route('/subscribed-channels/:subscriberId').get(verifyToken, getSubscribedChannels);
export default router;