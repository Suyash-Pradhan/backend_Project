import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as dashboardService from "../services/dashboard.service.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId format");
    }

    const stats = await dashboardService.getChannelStats(channelId);

    return res.status(200).json(new ApiResponse(200, stats, "channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId format");
    }

    const videos = await dashboardService.getChannelVideos(channelId);

    return res.status(200).json(new ApiResponse(200, videos, "channel videos fetched successfully"));
});

export {
    getChannelStats,
    getChannelVideos
};