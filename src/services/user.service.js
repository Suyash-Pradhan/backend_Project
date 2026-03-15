import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
};

export const registerUser = async ({ fullName, username, email, password, avatarLocalPath, coverImageLocalPath }) => {
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existedUser) {
        throw new ApiError(409, "User already exists with this email or username");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    let coverImage = null;
    
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    if (!avatar) {
        throw new ApiError(500, "Error uploading avatar to Cloudinary");
    }

    const user = await User.create({
        fullname: fullName,
        username,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    return await User.findById(user._id).select('-password -refreshToken');
};

export const loginUser = async ({ username, email, password }) => {
    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

    return { loggedInUser, accessToken, refreshToken };
};

export const logoutUser = async (userId) => {
    await User.findByIdAndUpdate(
        userId,
        { $set: { refreshToken: null } },
        { new: true }
    );
};

export const refreshAccessToken = async (incomingRefreshToken) => {
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id);
        
        if (!user || user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid or expired token");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
        
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(401, "Token verification failed");
    }
};

export const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findById(userId);
    const isCorrectPassword = await user.isPasswordCorrect(oldPassword);
    
    if (!isCorrectPassword) {
        throw new ApiError(400, "Old password is incorrect");
    }
    
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
};

export const updateUserDetails = async (userId, { fullName, email }) => {
    return await User.findByIdAndUpdate(
        userId,
        { $set: { fullname: fullName, email } },
        { new: true }
    ).select("-password -refreshToken");
};

export const updateAvatar = async (userId, localAvatarPath) => {
    const avatar = await uploadOnCloudinary(localAvatarPath);
    
    if (!avatar) {
        throw new ApiError(500, "Error uploading avatar");
    }
    
    return await User.findByIdAndUpdate(
        userId,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password -refreshToken");
};

export const updateCoverImage = async (userId, localCoverImagePath) => {
    const coverImage = await uploadOnCloudinary(localCoverImagePath);
    
    if (!coverImage) {
        throw new ApiError(500, "Error uploading cover image");
    }
    
    return await User.findByIdAndUpdate(
        userId,
        { $set: { coverImage: coverImage.url } },
        { new: true }
    ).select("-password -refreshToken");
};

export const getChannelProfile = async (channelUsername, requestUserId) => {
    const channel = await User.aggregate([
        { $match: { username: channelUsername.toLowerCase() } },
        { $lookup: { from: 'subscriptions', localField: '_id', foreignField: 'channel', as: 'subscribers' } },
        { $lookup: { from: 'subscriptions', localField: '_id', foreignField: 'subscriber', as: 'subscribedTo' } },
        {
            $addFields: {
                subscribersCount: { $size: '$subscribers' },
                subscribedToCount: { $size: '$subscribedTo' },
                isSubscribed: {
                    $cond: {
                        if: { $in: [new mongoose.Types.ObjectId(requestUserId), '$subscribers.subscriber'] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist");
    }

    return channel[0];
};

export const getUserWatchHistory = async (userId) => {
    const user = await User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(userId) } },
        {
            $lookup: {
                from: 'videos',
                localField: 'watchHistory',
                foreignField: '_id',
                as: 'watchHistory',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: { owner: { $first: '$owner' } }
                    }
                ]
            }
        }
    ]);
    
    return user[0]?.watchHistory || [];
};
