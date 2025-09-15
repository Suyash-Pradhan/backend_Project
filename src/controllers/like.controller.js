import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    if (!videoId) {
        throw new ApiError(400, "videoId is required")
    }
    const liked = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })
    if (!liked) {
        const newLike = await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
        return res.status(201).json(new ApiResponse(201, newLike, "video liked"))
    }
    const unliked = await Like.deleteOne({
        video: videoId,
        likedBy: req.user._id
    })
    return res.status(200).json(new ApiResponse(200, unliked, "video unliked"))
})
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    if (!commentId) {
        throw new ApiError(400, "videoId is required")
    }
    const liked = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })
    if (!liked) {
        const newLike = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
        return res.status(201).json(new ApiResponse(201, newLike, "video liked"))
    }
    const unliked = await Like.deleteOne({
        comment: commentId,
        likedBy: req.user._id
    })
    return res.status(200).json(new ApiResponse(200, unliked, "video unliked"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    if (!tweetId) {
        throw new ApiError(400, "videoId is required")
    }
    const liked = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })
    if (!liked) {
        const newLike = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })
        return res.status(201).json(new ApiResponse(201, newLike, "video liked"))
    }
    const unliked = await Like.deleteOne({
        tweet: tweetId,
        likedBy: req.user._id
    })
    return res.status(200).json(new ApiResponse(200, unliked, "video unliked"))


}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const LikedVideo = Like.aggregate([
        { $match: { likedBy: new mongoose.Types.ObjectId(req.user._id) } },
        {
            $lookup: {
                from: 'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'video'
            }
        },
        { $unwind: '$video' },
        { $sort: { createdAt: -1 } },
        {
            $project: {
                '_id': 1,
                'video._id': 1,
                'video.title': 1,
                'video.videoFile': 1,
                'video.thumbnail': 1,
                'video.views': 1,
                'video.duration': 1,
                'video.createdAt': 1
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200, LikedVideo, "liked videos list"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}