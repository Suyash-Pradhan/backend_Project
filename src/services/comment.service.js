import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";

export const getVideoComments = async (videoId, page = 1, limit = 10) => {
    return await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
                pipeline: [
                    { $project: { _id: 1, username: 1, fullname: 1, avatar: 1 } }
                ]
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                owner: { $arrayElemAt: ['$owner', 0] }
            }
        },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
    ]);
};

export const addComment = async (videoId, content, userId) => {
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }
    const comment = await Comment.create({
        content: content,
        owner: userId,
        video: videoId
    });
    
    await comment.populate('owner', 'username fullname avatar');
    
    return comment;
};

export const updateComment = async (commentId, content, userId) => {
    const updatedComment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: userId },
        { $set: { content: content } },
        { new: true }
    );
    if (!updatedComment) {
        throw new ApiError(404, 'Comment not found or you are not the owner of the comment');
    }
    return updatedComment;
};

export const deleteComment = async (commentId, userId) => {
    const deletedComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: userId
    });
    if (!deletedComment) {
        throw new ApiError(404, 'Comment not found or you are not the owner of the comment');
    }
    return deletedComment;
};
