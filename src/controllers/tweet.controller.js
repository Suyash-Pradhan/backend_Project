import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as tweetService from "../services/tweet.service.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    
    if (!content) {
        throw new ApiError(400, "content is required");
    }

    const tweet = await tweetService.createTweet(content, req.user._id);

    return res.status(201).json(new ApiResponse(201, tweet, "tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId format");
    }

    const tweets = await tweetService.getUserTweets(userId);

    return res.status(200).json(new ApiResponse(200, tweets, "user tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId format");
    }

    const tweet = await tweetService.updateTweet(tweetId, content, req.user._id);

    return res.status(200).json(new ApiResponse(200, tweet, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId format");
    }

    const tweet = await tweetService.deleteTweet(tweetId, req.user._id);

    return res.status(200).json(new ApiResponse(200, null, "tweet deleted successfully"));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};