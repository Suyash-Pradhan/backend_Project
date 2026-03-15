import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import uploadOnCloudinary from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //  get all videos based on query, sort, pagination

    const querycondition = { isPublished: true }
    if (query) {
        querycondition.title = { $regex: query, $options: 'i' }
    }
    if (userId && isValidObjectId(userId)) {
        querycondition.owner = userId
    }
    
    const sortbycondition = {}
    if (sortBy) {
        sortbycondition[sortBy] = sortType === 'asc' ? 1 : -1
    } else {
        sortbycondition['createdAt'] = -1
    }
    
    const videos = await Video.find(querycondition)
        .populate('owner', 'username fullname avatar')
        .sort(sortbycondition)
        .skip(parseInt(page - 1) * parseInt(limit))
        .limit(parseInt(limit))

    const totalVideos = await Video.countDocuments(querycondition)

    return res
        .status(200)
        .json(new ApiResponse(200, {
            videos,
            totalVideos,
            totalPages: Math.ceil(totalVideos / limit),
            currentPage: parseInt(page)
        }, 'Videos fetched successfully'))
})

const getMyVideos = asyncHandler(async (req, res) => {
    // return all videos for the logged-in user, published or not
    const { page = 1, limit = 20 } = req.query
    const videos = await Video.find({ owner: req.user._id })
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))

    const totalVideos = await Video.countDocuments({ owner: req.user._id })

    return res.status(200).json(new ApiResponse(200, {
        videos,
        totalVideos,
        totalPages: Math.ceil(totalVideos / limit),
        currentPage: parseInt(page)
    }, 'Your videos fetched successfully'))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!title) {
        throw new ApiError(400, 'Title is required')
    }
    const videoFile = req.files?.videoFile?.[0]?.path
    const thumbnailFile = req.files?.thumbnail?.[0]?.path
    if (!videoFile) {
        throw new ApiError(400, 'Video file is required')
    }
    if (!thumbnailFile) {
        throw new ApiError(400, 'Thumbnail is required')
    }
    // console.log("info",videoFile, thumbnailFile)
    const CloudnaryLinkVideo = await UplodeonCloudnary(videoFile)
    const CloudnaryLinkThumbnail = await UplodeonCloudnary(thumbnailFile)

    if (!CloudnaryLinkVideo) {
        throw new ApiError(500, 'Video upload failed')
    }
    if (!CloudnaryLinkThumbnail) {
        throw new ApiError(500, 'Thumbnail upload failed')
    }

    const uploadedVideo = await Video.create({
        title: title,
        videoFile: CloudnaryLinkVideo.url,
        thumbnail: CloudnaryLinkThumbnail.secure_url,
        desc: description,
        duration: CloudnaryLinkVideo.duration,
        owner: req.user._id
    })
    return res.status(201).json(new ApiResponse(201, uploadedVideo, 'Video published successfully'))
})


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video id')
    }
    const video = await Video.findOne({
        _id: videoId,
        isPublished: true
    }).populate('owner', 'username fullname avatar')
    
    if (!video) {
        throw new ApiError(404, 'Video not found')
    }

    const likesCount = await Like.countDocuments({ video: videoId })

    const payload = {
        ...video.toObject(),
        likesCount
    }

    return res
        .status(200)
        .json(new ApiResponse(200, payload, 'Video fetched successfully'))
})

const updateVideo = asyncHandler(async (req, res) => {
    // update video details like title, description, thumbnail
    const { videoId } = req.params
    const { title, description } = req.body
    if (!videoId) {
        throw new ApiError(400, 'video id is required')
    }
    if (!title && !description && !req.file) {
        throw new ApiError(400, 'At least one field is required to update')
    }

    const thumbnailFile = req.file.path
    // console.log("thumbnailFile", thumbnailFile)

    const CloudnaryLinkThumbnail = await UplodeonCloudnary(thumbnailFile)

    const uplodFiles = {}
    if (thumbnailFile) uplodFiles.thumbnail = CloudnaryLinkThumbnail.secure_url
    if (title) uplodFiles.title = title
    if (description) uplodFiles.desc = description

    const video = await Video.findByIdAndUpdate(videoId, {
        $set: uplodFiles
    }, { new: true })



    if (!video) {
        throw new ApiError(404, 'Video not found')
    }
    return res
        .status(200)
        .json(new ApiResponse(200, video, 'Video updated successfully'))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const video = await Video.findByIdAndDelete(videoId)
    if (!video) {
        throw new ApiError(404, 'Video not found')
    }
    return res
        .status(200)
        .json(new ApiResponse(200, video, 'Video deleted successfully'))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findOne({
        _id: videoId,
        owner: req.user?._id
    })

    if (!video) {
        throw new ApiError(403, 'You are not authorized to update this video')
    }
    video.isPublished = !video.isPublished
    await video.save()

    return res.status(200).json(new ApiResponse(200, video, 'Video publish status updated successfully'))

})
const recordView = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "videoId is required")
    }

    const video = await Video.updateOne({
        _id: videoId,
        isPublished: true
    }, {
        $inc: { views: 1 }
    })

    if(!video.matchedCount){
        throw new ApiError(404, "video not found")
    }
    return res.status(200).json(new ApiResponse(200, null, "view recorded successfully"))
})

export {
    getAllVideos,
    getMyVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    recordView
}