import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as subscriptionService from "../services/subscription.service.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId format");
    }

    const { subscription, isSubscribed } = await subscriptionService.toggleSubscription(channelId, req.user._id);

    return res.status(isSubscribed ? 201 : 200).json(
        new ApiResponse(isSubscribed ? 201 : 200, subscription, isSubscribed ? "subscribed successfully" : "unsubscribed successfully")
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId format");
    }

    const subscribers = await subscriptionService.getUserChannelSubscribers(channelId);

    return res.status(200).json(new ApiResponse(200, subscribers, "subscribers list"));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId format");
    }

    const subscribedChannels = await subscriptionService.getSubscribedChannels(subscriberId);

    return res.status(200).json(new ApiResponse(200, subscribedChannels, "subscribed channels"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
