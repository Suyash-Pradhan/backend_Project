import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";

export const createPlaylist = async ({ name, description, ownerId }) => {
    return await Playlist.create({
        name,
        description,
        owner: ownerId
    });
};

export const getUserPlaylists = async (userId) => {
    return await Playlist.find({ owner: userId })
        .populate('videos')
        .populate('owner', 'username');
};

export const getPlaylistById = async (playlistId) => {
    const playlist = await Playlist.findById(playlistId)
        .populate('videos')
        .populate('owner', 'username');
        
    if (!playlist) throw new ApiError(404, "playlist not found");
    return playlist;
};

export const addVideoToPlaylist = async (playlistId, videoId, userId) => {
    const playlist = await Playlist.findById(playlistId);
    
    if (!playlist) throw new ApiError(404, "playlist not found");
    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "you are not authorized to add video to this playlist");
    }
    
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "video not found");
    
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "video already in playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();
    return playlist;
};

export const removeVideoFromPlaylist = async (playlistId, videoId, userId) => {
    const deletedVideo = await Playlist.updateOne(
        {
            _id: playlistId,
            owner: userId,
            videos: videoId
        }, 
        { $pull: { videos: videoId } }
    );
    
    if (!deletedVideo.matchedCount) {
        throw new ApiError(404, "playlist or video not found or you are not authorized to remove video from this playlist");
    }
    return deletedVideo;
};

export const deletePlaylist = async (playlistId, userId) => {
    const playlist = await Playlist.deleteOne({
        _id: playlistId,
        owner: userId
    });

    if (!playlist.deletedCount) {
        throw new ApiError(404, "playlist not found or you are not authorized to delete this playlist");
    }
    return playlist;
};

export const updatePlaylist = async (playlistId, { name, description }, userId) => {
    const playlist = await Playlist.findOneAndUpdate(
        { _id: playlistId, owner: userId },
        { name, description },
        { new: true }
    );

    if (!playlist) {
        throw new ApiError(404, "playlist not found or you are not authorized to update this playlist");
    }
    return playlist;
};
