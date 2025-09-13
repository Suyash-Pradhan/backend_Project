import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import UplodeonCloudnary from "../utils/cloudnarry.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //  get all videos based on query, sort, pagination

    const querycondition = {isPublished: true}
    if (query) {
        querycondition.title = { $regex: query, $options: 'i' }
    }
    const sortbycondition = {}
    if (sortBy) {
        sortbycondition[sortBy] = sortBy === 'asc' ? -1 : 1
    } else {
        sortbycondition[createdAt] = -1
    }
    const video = await Video.find(querycondition)
        .sort(sortbycondition)
        .skip(parseInt(page - 1) * parseInt(limit))
        .limit(parseInt(limit))

    if (!video) {
        throw new ApiError(404, 'Video not found')
    }
    return res
        .status(200)
        .json(new ApiResponse(200, video, 'Videos fetched successfully'))
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
        _id:videoId,
        isPublished:true
    })
    if (!video) {
        throw new ApiError(404, 'Video not found')
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, 'Video fetched successfully'))
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

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}