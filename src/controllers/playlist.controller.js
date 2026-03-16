import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as playlistService from "../services/playlist.service.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        throw new ApiError(400, "name is required");
    }

    const playlist = await playlistService.createPlaylist({
        name,
        description,
        ownerId: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, playlist, "playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId format");
    }

    const userPlaylist = await playlistService.getUserPlaylists(userId);
    
    return res.status(200).json(new ApiResponse(200, userPlaylist, "user playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId format");
    }

    const playlist = await playlistService.getPlaylistById(playlistId);
    
    return res.status(200).json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlistId or videoId format");
    }

    const playlist = await playlistService.addVideoToPlaylist(playlistId, videoId, req.user._id);
    
    return res.status(200).json(new ApiResponse(200, playlist, "video added to playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlistId or videoId format");
    }

    const deletedVideo = await playlistService.removeVideoFromPlaylist(playlistId, videoId, req.user._id);
    
    return res.status(200).json(new ApiResponse(200, deletedVideo, "video removed from playlist successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId format");
    }

    await playlistService.deletePlaylist(playlistId, req.user._id);
    
    return res.status(200).json(new ApiResponse(200, null, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId format");
    }

    const playlist = await playlistService.updatePlaylist(playlistId, { name, description }, req.user._id);
    
    return res.status(200).json(new ApiResponse(200, playlist, "playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};