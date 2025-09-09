
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { parse } from "dotenv"

const getVideoComments = asyncHandler(async (req, res) => {
    // get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    const comments = await Comment.aggregate([
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
                    {
                        $project: { id: 1, username: 1, fullname: 1, avatar: 1 }
                    }
                ]
            }
        }, {
            $project: {

                content: 1,
                createdAt: 1,
                owner: { $arrayElemAt: ['$owner', 0] }
            }
        }, { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
    ])
    return res.status(200).json(new ApiResponse(200, comments, 'Comments fetched successfully'))

})

const addComment = asyncHandler(async (req, res) => {
    //  add a comment to a video
    const { videoId } = req.params
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, 'Content is required')
    }
    const video = await User.findById(videoId)
    if (!video) {
        throw new ApiError(404, 'Video not found')
    }
    const comment = await Comment.create({
        content: content,
        owner: req.user._id,
        video: videoId

    })
    return res.status(201).json(new ApiResponse(201, Comment, 'Comment added successfully'))
})

const updateComment = asyncHandler(async (req, res) => {
    // update a comment
    const { commentId } = req.params
    const { content } = req.body

    if (!content) {
        throw new ApiError(400, 'Content is required')
    }
    const updatedComment = await Comment.findOneAndUpdate({
        _id: commentId,
        owner: req.user._id
    }, {
        $set: {
            content: content
        }
    })
    if (!updatedComment) {
        throw new ApiError(404, 'Comment not found or you are not the owner of the comment')
    }
    return res.status(200).json(new ApiResponse(200, updatedComment, 'Comment updated successfully'))
})

const deleteComment = asyncHandler(async (req, res) => {
    // delete a comment
    const { commentId } = req.params
    const deletedComment = await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user._id
    })
    if (!deletedComment) {
        throw new ApiError(404, 'Comment not found or you are not the owner of the comment')
    }
    return res.status(200).json(new ApiResponse(200, deletedComment, 'Comment deleted successfully'))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}