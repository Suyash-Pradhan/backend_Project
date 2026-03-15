import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as videoService from "../services/video.service.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page, limit, query, sortBy, sortType, userId } = req.query;
    
    const paginatedVideos = await videoService.getAllVideos({
        page, limit, query, sortBy, sortType, userId
    });

    return res.status(200).json(new ApiResponse(200, paginatedVideos, 'Videos fetched successfully'));
});

const getMyVideos = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    
    const paginatedVideos = await videoService.getMyVideos({
        page, limit, userId: req.user._id
    });

    return res.status(200).json(new ApiResponse(200, paginatedVideos, 'Your videos fetched successfully'));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    
    if (!title || !description) {
        throw new ApiError(400, 'Title and description are required');
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    
    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, 'Video file and thumbnail are required');
    }

    const uploadedVideo = await videoService.publishVideo({
        title,
        description,
        videoLocalPath,
        thumbnailLocalPath,
        userId: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, uploadedVideo, 'Video published successfully'));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video id');
    }

    const video = await videoService.getVideoById(videoId);

    return res.status(200).json(new ApiResponse(200, video, 'Video fetched successfully'));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video id');
    }

    if (!title && !description && !req.file) {
        throw new ApiError(400, 'At least one field is required to update');
    }

    const thumbnailLocalPath = req.file?.path;

    const updatedVideo = await videoService.updateVideoDetails(videoId, {
        title,
        description,
        thumbnailLocalPath
    });

    return res.status(200).json(new ApiResponse(200, updatedVideo, 'Video updated successfully'));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video id');
    }

    const deletedVideo = await videoService.deleteVideo(videoId);

    return res.status(200).json(new ApiResponse(200, deletedVideo, 'Video deleted successfully'));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video id');
    }

    const video = await videoService.togglePublishStatus(videoId, req.user._id);

    return res.status(200).json(new ApiResponse(200, video, 'Video publish status updated successfully'));
});

const recordView = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    await videoService.recordVideoView(videoId);

    return res.status(200).json(new ApiResponse(200, null, "View recorded successfully"));
});

export {
    getAllVideos,
    getMyVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    recordView
};