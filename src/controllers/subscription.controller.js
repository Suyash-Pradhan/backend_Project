import mongoose from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!channelId) {
        throw new ApiError(400, "channelId is required")
    }
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channelId format")
    }
    const channelObjectId = new mongoose.Types.ObjectId(channelId)

    const removedSubscription = await Subscription.findOneAndDelete({
        channel: channelObjectId,
        subscriber: req.user._id
    })
    if (removedSubscription) {
        return res.status(200).json(new ApiResponse(200, removedSubscription, "unsubscribed successfully"))
    }

    const newSubscription = await Subscription.create({
        channel: channelObjectId,
        subscriber: req.user._id
    })
    return res.status(201).json(new ApiResponse(201, newSubscription, "subscribed successfully"))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "channelId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channelId format")
    }

    const subscribers = await Subscription.aggregate([
        { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
        {
            $lookup: {
                from: 'users',
                localField: 'subscriber',
                foreignField: '_id',
                as: 'subscriber'
            }

        },
        {
            $unwind: '$subscriber'
        },
        { $sort: { 'subscriber.createdAt': -1 } },
        {
            $project: {
                '_id': 1,
                'subscriber._id': 1,
                'subscriber.username': 1,
                'subscriber.avatar': 1,
                'createdAt': 1

            }
        }



    ])
    return res.status(200).json(new ApiResponse(200, subscribers, "subscribers list"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!subscriberId) {
        throw new ApiError(400, "subscriberId is required")
    }
    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'channel',
                foreignField: '_id',
                as: 'channel'
            }
        },
        {
            $unwind: '$channel'
        },
        {
            $project: {
                '_id': '$channel._id',
                'username': '$channel.username',
                'fullname': '$channel.fullname',
                'avatar': '$channel.avatar',
                'subscribedAt': '$createdAt'
            }
        },
        {
            $sort: { 'subscribedAt': -1 }
        }
    ])

    return res.status(200).json(new ApiResponse(200, subscribedChannels, "subscribed channels"))
})

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels }
