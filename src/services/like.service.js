import mongoose from "mongoose";
import { Like } from "../models/like.model.js";

export const toggleVideoLike = async (videoId, userId) => {
    const liked = await Like.findOne({
        video: videoId,
        likedBy: userId
    });

    let isLiked;
    if (!liked) {
        await Like.create({
            video: videoId,
            likedBy: userId
        });
        isLiked = true;
    } else {
        await Like.deleteOne({
            video: videoId,
            likedBy: userId
        });
        isLiked = false;
    }

    const likesCount = await Like.countDocuments({ video: videoId });

    return { isLiked, likesCount };
};

export const toggleCommentLike = async (commentId, userId) => {
    const liked = await Like.findOne({
        comment: commentId,
        likedBy: userId
    });

    if (!liked) {
        const newLike = await Like.create({
            comment: commentId,
            likedBy: userId
        });
        return { like: newLike, isLiked: true };
    }
    
    const unliked = await Like.deleteOne({
        comment: commentId,
        likedBy: userId
    });
    return { like: unliked, isLiked: false };
};

export const toggleTweetLike = async (tweetId, userId) => {
    const liked = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    });

    if (!liked) {
        const newLike = await Like.create({
            tweet: tweetId,
            likedBy: userId
        });
        return { like: newLike, isLiked: true };
    }
    
    const unliked = await Like.deleteOne({
        tweet: tweetId,
        likedBy: userId
    });
    return { like: unliked, isLiked: false };
};

export const getLikedVideos = async (userId) => {
    return await Like.aggregate([
        { $match: { likedBy: new mongoose.Types.ObjectId(userId) } },
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
    ]);
};
