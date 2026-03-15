import { Router } from "express"
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js"
import { verifyToken } from "../middlewares/auth.middleware.js"

const router = Router()

// public read
router.route("/user/:userId").get(getUserTweets)

// protected write/update/delete
router.route("/").post(verifyToken, createTweet)
router.route("/:tweetId").patch(verifyToken, updateTweet)
router.route("/:tweetId").delete(verifyToken, deleteTweet)

export default router
