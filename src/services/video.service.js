import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { isValidObjectId } from "mongoose";

export const getAllVideos = async ({ page = 1, limit = 10, query, sortBy, sortType, userId }) => {
    const queryCondition = { isPublished: true };
    
    if (query) {
        queryCondition.title = { $regex: query, $options: 'i' };
    }
    
    if (userId && isValidObjectId(userId)) {
        queryCondition.owner = userId;
    }
    
    const sortCondition = {};
    if (sortBy) {
        sortCondition[sortBy] = sortType === 'asc' ? 1 : -1;
    } else {
        sortCondition['createdAt'] = -1;
    }
    
    const videos = await Video.find(queryCondition)
        .populate('owner', 'username fullname avatar')
        .sort(sortCondition)
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

    const totalVideos = await Video.countDocuments(queryCondition);

    return {
        videos,
        totalVideos,
        totalPages: Math.ceil(totalVideos / limit),
        currentPage: parseInt(page)
    };
};

export const getMyVideos = async ({ page = 1, limit = 20, userId }) => {
    const videos = await Video.find({ owner: userId })
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

    const totalVideos = await Video.countDocuments({ owner: userId });

    return {
        videos,
        totalVideos,
        totalPages: Math.ceil(totalVideos / limit),
        currentPage: parseInt(page)
    };
};

export const publishVideo = async ({ title, description, videoLocalPath, thumbnailLocalPath, userId }) => {
    const cloudinaryVideo = await uploadOnCloudinary(videoLocalPath);
    const cloudinaryThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!cloudinaryVideo) throw new ApiError(500, 'Video upload to Cloudinary failed');
    if (!cloudinaryThumbnail) throw new ApiError(500, 'Thumbnail upload to Cloudinary failed');

    const video = await Video.create({
        title,
        desc: description,
        videoFile: cloudinaryVideo.url,
        thumbnail: cloudinaryThumbnail.secure_url,
        duration: cloudinaryVideo.duration,
        owner: userId
    });

    return video;
};

export const getVideoById = async (videoId) => {
    const video = await Video.findOne({
        _id: videoId,
        isPublished: true
    }).populate('owner', 'username fullname avatar');
    
    if (!video) throw new ApiError(404, 'Video not found');

    const likesCount = await Like.countDocuments({ video: videoId });

    return {
        ...video.toObject(),
        likesCount
    };
};

export const updateVideoDetails = async (videoId, { title, description, thumbnailLocalPath }) => {
    const updatePayload = {};
    
    if (thumbnailLocalPath) {
        const cloudinaryThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!cloudinaryThumbnail) throw new ApiError(500, "Error uploading new thumbnail");
        updatePayload.thumbnail = cloudinaryThumbnail.secure_url;
    }
    
    if (title) updatePayload.title = title;
    if (description) updatePayload.desc = description;

    const video = await Video.findByIdAndUpdate(
        videoId,
        { $set: updatePayload },
        { new: true }
    );

    if (!video) throw new ApiError(404, 'Video not found');
    
    return video;
};

export const deleteVideo = async (videoId) => {
    const video = await Video.findByIdAndDelete(videoId);
    if (!video) throw new ApiError(404, 'Video not found');
    return video;
};

export const togglePublishStatus = async (videoId, userId) => {
    const video = await Video.findOne({ _id: videoId, owner: userId });

    if (!video) {
        throw new ApiError(403, 'You are not authorized to update this video or it does not exist');
    }
    
    video.isPublished = !video.isPublished;
    await video.save();

    return video;
};

export const recordVideoView = async (videoId) => {
    const video = await Video.updateOne(
        { _id: videoId, isPublished: true },
        { $inc: { views: 1 } }
    );

    if (!video.matchedCount) {
        throw new ApiError(404, "Video not found or not published");
    }
    
    return true;
};
