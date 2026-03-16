import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";

export const createTweet = async (content, userId) => {
    const tweet = await Tweet.create({
        content,
        owner: userId
    });
    if (!tweet) throw new ApiError(500, "tweet not created");
    return tweet;
};

export const getUserTweets = async (userId) => {
    return await Tweet.find({ owner: userId }).populate('owner', 'username avatar');
};

export const updateTweet = async (tweetId, content, userId) => {
    const tweet = await Tweet.findOneAndUpdate(
        { _id: tweetId, owner: userId },
        { content: content },
        { new: true }
    );
    if (!tweet) throw new ApiError(404, "tweet not found or you are not the owner");
    return tweet;
};

export const deleteTweet = async (tweetId, userId) => {
    const tweet = await Tweet.deleteOne({ _id: tweetId, owner: userId });
    if (!tweet.deletedCount) throw new ApiError(404, "tweet not found or you are not the owner");
    return tweet;
};
