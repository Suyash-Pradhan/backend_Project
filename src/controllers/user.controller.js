import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as userService from '../services/user.service.js';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password } = req.body;
    
    // Manual validation until Phase 3 (Zod middleware)
    if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const createdUser = await userService.registerUser({
        fullName,
        username,
        email,
        password,
        avatarLocalPath,
        coverImageLocalPath
    });

    res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!(email || username) || !password) {
        throw new ApiError(400, "Email/Username and password are required");
    }

    const { loggedInUser, accessToken, refreshToken } = await userService.loginUser({ username, email, password });

    return res.status(200)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await userService.logoutUser(req.user._id);

    return res.status(200)
        .clearCookie("refreshToken", COOKIE_OPTIONS)
        .clearCookie("accessToken", COOKIE_OPTIONS)
        .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized: No token provided");
    }

    const { accessToken, refreshToken } = await userService.refreshAccessToken(incomingRefreshToken);

    return res.status(200)
        .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
        .cookie("accessToken", accessToken, COOKIE_OPTIONS)
        .json(new ApiResponse(200, { accessToken, refreshToken }, "Token refreshed successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both old and new passwords are required");
    }

    await userService.changePassword(req.user._id, oldPassword, newPassword);

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    
    if (!fullName || !email) {
        throw new ApiError(400, "Full name and email are required");
    }

    const updatedUser = await userService.updateUserDetails(req.user._id, { fullName, email });

    res.status(200).json(new ApiResponse(200, updatedUser, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const localAvatarPath = req.file?.path;

    if (!localAvatarPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const updatedUser = await userService.updateAvatar(req.user._id, localAvatarPath);

    return res.status(200).json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const localCoverImagePath = req.file?.path;
    
    if (!localCoverImagePath) {
        throw new ApiError(400, "Cover image file is required");
    }

    const updatedUser = await userService.updateCoverImage(req.user._id, localCoverImagePath);

    return res.status(200).json(new ApiResponse(200, updatedUser, "Cover image updated successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username) {
        throw new ApiError(400, "Username is required");
    }

    const channelProfile = await userService.getChannelProfile(username, req.user?._id);

    return res.status(200).json(new ApiResponse(200, channelProfile, "Channel profile fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const watchHistory = await userService.getUserWatchHistory(req.user._id);
    
    return res.status(200).json(new ApiResponse(200, watchHistory, "Watch history fetched successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser as logoutuser, 
    refreshAccessToken as refreshacessToken, 
    changeCurrentPassword as chnagePassword, 
    updateAccountDetails as chnageuserDetails, 
    updateUserAvatar as changeAvatar,
    updateUserCoverImage as changeCoverImage,
    getCurrentUser as getcurrentuser,
    getUserChannelProfile as getchannelDetails,
    getWatchHistory,
};