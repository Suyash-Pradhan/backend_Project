import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId} = req.params
    if(!channelId){
        throw new ApiError(400, "channelId is required")
    }

    const videoCount = await Video.aggregate([
        {$match: {owner:new mongoose.Types.ObjectId(channelId)}},
        {$group:{ _id:'null', totalViews:{$sum:"$views"}, totalVideos:{$sum:1} }},
    ])
    return res.status(200).json(new ApiResponse(200,videoCount, "channel stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats, 
    getChannelVideos
    }