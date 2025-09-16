import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "content is required")
    }
    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    if (!tweet) {
        throw new ApiError(500, "tweet not created")
    }
    return res
        .staus(201)
        .json(new ApiResponse(201, tweet, "tweet created successfully"))
    //TODO: create tweet
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!userId) {
        throw new ApiError(400, "userId is required")
    }
    const tweets = await Tweet.find({ owner: userId })
        .populate('owner', 'username avatar')
    if (!tweets) {
        throw new ApiError(404, "tweets not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "user tweets fetched successfully"))
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body

    const tweet = await Tweet.findByIdAndUpdate({
        _id: tweetId,
        owner: req.user._id
    }, { content: content }, { new: true })

    if (!tweet) {
        throw new ApiError(404, "tweet not found or you are not the owner")
    }
    return res.status(200).json(new ApiResponse(200, tweet, "tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    const tweet = await Tweet.deleteOne({
        _id: tweetId,
        owner: req.user._id
    })
    if (!tweet.deletedCount) {
        throw new ApiError(404, "tweet not found or you are not the owner")
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}