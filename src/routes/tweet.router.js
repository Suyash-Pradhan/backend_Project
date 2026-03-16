import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"
import {verifyToken} from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validate.middleware.js";
import { tweetSchema } from "../validators/tweet.validator.js";

const router = Router();
router.use(verifyToken); // Apply verifyToken to all routes in this file

router.route("/").post(validate(tweetSchema), createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(validate(tweetSchema), updateTweet).delete(deleteTweet);
router.route("/:tweetId").delete(verifyToken, deleteTweet)

export default router
