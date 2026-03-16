import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";

export const toggleSubscription = async (channelId, subscriberId) => {
    const channelObjectId = new mongoose.Types.ObjectId(channelId);
    
    const removedSubscription = await Subscription.findOneAndDelete({
        channel: channelObjectId,
        subscriber: subscriberId
    });
    
    if (removedSubscription) {
        return { subscription: removedSubscription, isSubscribed: false };
    }
    
    const newSubscription = await Subscription.create({
        channel: channelObjectId,
        subscriber: subscriberId
    });
    
    return { subscription: newSubscription, isSubscribed: true };
};

export const getUserChannelSubscribers = async (channelId) => {
    return await Subscription.aggregate([
        { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
        {
            $lookup: {
                from: 'users',
                localField: 'subscriber',
                foreignField: '_id',
                as: 'subscriber'
            }
        },
        { $unwind: '$subscriber' },
        { $sort: { 'createdAt': -1 } },
        {
            $project: {
                '_id': 1,
                'subscriber._id': 1,
                'subscriber.username': 1,
                'subscriber.avatar': 1,
                'createdAt': 1
            }
        }
    ]);
};

export const getSubscribedChannels = async (subscriberId) => {
    return await Subscription.aggregate([
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
        { $unwind: '$channel' },
        {
            $project: {
                '_id': '$channel._id',
                'username': '$channel.username',
                'fullname': '$channel.fullname',
                'avatar': '$channel.avatar',
                'subscribedAt': '$createdAt'
            }
        },
        { $sort: { 'subscribedAt': -1 } }
    ]);
};
