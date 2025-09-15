import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })
    return res.status(201).json(new ApiResponse(201, playlist, "playlist created successfully")
    )

    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!userId) {
        throw new ApiError(400, "userId is required")
    }
    //TODO: get user playlists
    const userPlaylist = await Playlist.find({ owner: userId })
        .populate('videos')
        .populate('owner', 'username ')
    if (!userPlaylist) {
        throw new ApiError(404, "playlist not found")
    }
    return res.status(200).json(new ApiResponse(200, userPlaylist, "user playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    const playlist = await Playlist.findById(playlistId)
        .populate('videos')
        .populate('owner', 'username')

    if (!playlist) {
        throw new ApiError(404, "playlist not found")
    }
    return res.status(200).json(new ApiResponse(200, playlist, "playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params


    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlistId and videoId are required")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "playlist not found")
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "you are not authorized to add video to this playlist")
    }
    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "video not found")
    }
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "video already in playlist")
    }

    playlist.videos.push(videoId)

    await playlist.save()
    return res.status(200).json(new ApiResponse(200, playlist, "video added to playlist successfully"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist
    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlistId and videoId are required")
    }

    const deletedVideo = await Playlist.updateOne(
        {
            _id: playlistId,
            owner: req.user._id,
            videos: videoId

        }, { $pull: { videos: videoId } }
    )
    if (!deletedVideo.matchedCount) {
        throw new ApiError(404, "playlist or video not found or you are not authorized to remove video from this playlist")
    }
    return res.status(200).json(new ApiResponse(200, deletedVideo, "video removed from playlist successfully"))



})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if (!playlistId) {
        throw new ApiError(400, "playlistId is required")
    }
    const playlist = await Playlist.deleteOne({
        _id: playlistId,
        owner: req.user._id
    })

    if (!playlist.matchedcount) {
        throw new ApiError(404, "playlist or video not found or you are not authorized to delete this playlist")
    }
    return res.status(200).json(new ApiResponse(200, null, "playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //    update playlist
    if (!playlistId) {
        throw new ApiError(400, "playlistId is required")
    }
    const playlist = await Playlist.findOneAndUpdate({
        _id: playlistId,
        owner: req.user._id
    }, {
        name,
        description
    }, { new: true })

    if (!playlist) {
        throw new ApiError(404, "playlist not found or you are not authorized to update this playlist")
    }
    return res.status(200).json(new ApiResponse(200, playlist, "playlist updated successfully"))
})


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}