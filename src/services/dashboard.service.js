import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";

export const getChannelStats = async (channelId) => {
    const videoCount = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" }, totalVideos: { $sum: 1 } } }
    ]);

    const subscriberCount = await Subscription.countDocuments({ channel: channelId });

    const totalLikedVideos = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'video',
                as: 'likes'
            }
        },
        { $unwind: '$likes' },
        { $group: { _id: null, totalLikes: { $sum: 1 } } }
    ]);

    return {
        totalviews: videoCount[0]?.totalViews || 0,
        totalVideos: videoCount[0]?.totalVideos || 0,
        totalSubscribers: subscriberCount,
        totalLikes: totalLikedVideos[0]?.totalLikes || 0
    };
};

export const getChannelVideos = async (channelId) => {
    return await Video.find({ owner: channelId });
};
