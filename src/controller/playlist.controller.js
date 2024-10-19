import { isValidObjectId } from "mongoose";
import { Playlist } from "../model/playlists.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../model/video.model.js";

const createPlaylist = asyncHandler (async (req, res) => {
    const { name, description } = req.body;

    if(!name) {
        throw new ApiError(401, "Please provide the name for the playlist");
    }

    if(!description) {
        throw new ApiError(401, "Please provide the description for the playlist");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
    });

    if(!playlist) {
        throw new ApiError(500, "Playlist not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "Playlist created successfully")
        );
});

const getUserPlaylists = asyncHandler (async (req, res) => {
    const { userId } = req.params;

    if(!isValidObjectId(userId)) {
        throw new ApiError(401, "Not a valid userId");
    }

    const playlists = await Playlist.find({ owner: userId });

    if(!playlists) {
        throw new ApiError(404, "Playlists not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlists, "Getting the Playlists of the particular user.")
        );
});

const getPlaylistById = asyncHandler (async (req, res) => {
    const { playlistId } = req.params;

    if(!isValidObjectId(playlistId)) {
        throw new ApiError(401, "Invalid playlistId");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "Get the particular playlist")
        );
});

const addVideoToPlaylist = asyncHandler (async (req, res) => {
    const { videoId, playlistId } = req.params;

    if(!isValidObjectId(videoId)) {
        throw new ApiError(401, "Not a valid videoId");
    }

    if(!isValidObjectId(playlistId)) {
        throw new ApiError(401, "Not a valid playlistId");
    }

    const video = await Video.findById(videoId);
    const playlist = await Playlist.findById(playlistId);

    if(playlist.owner.toString() !== video.owner.toString()  ||  req.user._id.toString() !== playlist.owner.toString()   ||  req.user._id.toString() !== video.owner.toString()) {
        throw new ApiError(401, "Only video owner can add the video to the playlist");
    }

    if(!video) {
        throw new ApiError(404, "Video not found");
    }

    const addVideo = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: video,
            }
        }
    );

    if(!addVideo) {
        throw new ApiError(400, "Video cant be added to the playlist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, addVideo, "Video added to the playlist")
        );
});

const removeVideoFromPlaylist = asyncHandler (async (req, res) => {
    const { playlistId, videoId } = req.params;

    if(!isValidObjectId(playlistId)) {
        throw new ApiError(401, "Invalid playlistId");
    }
    
    if(!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid videoId");
    }

    const video = await Video.findById(videoId);
    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(401, "Playlist not found");
    }

    if(!video) {
        throw new ApiError(401, "Video not found");
    }

    if(playlist.owner.toString() !== video.owner.toString()  ||  req.user._id.toString() !== playlist.owner.toString()) {
        throw new ApiError(401, "Only video owner can add the video to the playlist");
    }

    const videoRemove = await Playlist.findByIdAndUpdate(
        playlist._id,
        {
            $pull: {
                videos: video._id
            },
        }
    );

    console.log(videoRemove.videos);

    if(!videoRemove.videos) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, videoRemove, "Video removed successfully from the playlist.")
        );
});

const deletePlaylist = asyncHandler (async (req, res) => {
    const { playlistId } = req.params;

    if(!isValidObjectId(playlistId)) {
        throw new ApiError(401, "Not a valid playlistId");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(401, "Playlist not found");
    }

    if(req.user._id.toString() !== playlist.owner.toString()) {
        throw new ApiError(401, "Only Playlist owner can delete the playlist");
    }

    const playlistDelete = await Playlist.findByIdAndDelete(playlistId);

    if(!playlistDelete) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlistDelete, "Playlist deleted sucessfully")
        );
});

const  updatePlaylist = asyncHandler (async (req, res) => {
    const { playlistId } = req.params;

    if(!isValidObjectId(playlistId)) {
        throw new ApiError(401, "Not a valid playlistId");
    }

    const { name, description } = req.body;

    if(!name) {
        throw new ApiError(401, "Please provide the updated name");
    }

    if(!description) {
        throw new ApiError(401, "Please provide the updated description");
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist) {
        throw new ApiError(404, "No such type of playlist exist")
    }

    if(req.user._id.toString() !== playlist.owner.toString()) {
        throw new ApiError(401, "Only Playlist owner can update the playlist");
    }

    const playlistUpdate = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description,
            }
        },
        {
            new: true,
        }
    );

    if(!playlistUpdate) {
        throw new ApiError(500, "Something went wrong while updating the playlist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlistUpdate, "Playlist updated successfully")
        );
});

export { updatePlaylist, deletePlaylist, removeVideoFromPlaylist, addVideoToPlaylist, createPlaylist, getUserPlaylists, getPlaylistById };