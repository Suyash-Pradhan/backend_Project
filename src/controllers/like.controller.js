import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as likeService from "../services/like.service.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId format");
    }

    const { isLiked, likesCount } = await likeService.toggleVideoLike(videoId, req.user._id);

    return res.status(200).json(new ApiResponse(200, { isLiked, likesCount }, isLiked ? "video liked" : "video unliked"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId format");
    }

    const { like, isLiked } = await likeService.toggleCommentLike(commentId, req.user._id);

    return res.status(isLiked ? 201 : 200).json(new ApiResponse(isLiked ? 201 : 200, like, isLiked ? "comment liked" : "comment unliked"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId format");
    }

    const { like, isLiked } = await likeService.toggleTweetLike(tweetId, req.user._id);

    return res.status(isLiked ? 201 : 200).json(new ApiResponse(isLiked ? 201 : 200, like, isLiked ? "tweet liked" : "tweet unliked"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await likeService.getLikedVideos(req.user._id);

    return res.status(200).json(new ApiResponse(200, likedVideos, "liked videos list"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};