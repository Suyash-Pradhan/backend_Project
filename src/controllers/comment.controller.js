import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as commentService from "../services/comment.service.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId format");
    }

    const comments = await commentService.getVideoComments(videoId, page, limit);

    return res.status(200).json(new ApiResponse(200, comments, 'Comments fetched successfully'));
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId format");
    }
    if (!content) {
        throw new ApiError(400, 'Content is required');
    }

    const comment = await commentService.addComment(videoId, content, req.user._id);

    return res.status(201).json(new ApiResponse(201, comment, 'Comment added successfully'));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId format");
    }
    if (!content) {
        throw new ApiError(400, 'Content is required');
    }

    const updatedComment = await commentService.updateComment(commentId, content, req.user._id);

    return res.status(200).json(new ApiResponse(200, updatedComment, 'Comment updated successfully'));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId format");
    }

    const deletedComment = await commentService.deleteComment(commentId, req.user._id);

    return res.status(200).json(new ApiResponse(200, deletedComment, 'Comment deleted successfully'));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};