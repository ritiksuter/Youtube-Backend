import { isValidObjectId } from "mongoose";
import { Video } from "../model/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const publishAVideo = asyncHandler (async (req, res) => {
    const { title, description } = req.body;

    if(!title || !description) {
        throw new ApiError(401, "Please provide the title and the description");
    }

    const localVideoPath = req.files?.videoFile[0].path;
    const localThumbnailPath = req.files?.thumbnail[0].path;

    if(!localVideoPath) {
        throw new ApiError(401, "Thumbnail image not found");
    }

    if(!localThumbnailPath) {
        throw new ApiError(401, "Thumbnail image not found");
    }

    // const uploadVideo = await uploadOnCloudinary(localVideoPath);
    // const uploadThumbnail = await uploadOnCloudinary(localThumbnailPath);

    // if(!uploadVideo) {
    //     throw new ApiError(401, "Video not uploaded in Cloudinary");
    // }

    // if(!uploadThumbnail) {
    //     throw new ApiError(401, "Thumbnail is not uploaded in Cloudinary");
    // }

    const video = await Video.create({
        videoFile: localVideoPath,
        thumbnail: localThumbnailPath,
        owner: req?.user._id,
        title: title,
        description: description,
        duration: 10,
        views: 0,
        isPublished: true,
    });

    if(!video) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video uploaded successfully")
        );
});

const getVideoById = asyncHandler (async (req, res) => {
    const { videoId } = req.params;

    if(!isValidObjectId(videoId)) {
        throw new ApiError(401, "Not a valid videoId");
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Get the video successfully")
        );
});

const updateVideo = asyncHandler (async (req, res) => {
    const { videoId } = req.params;

    
    if(!isValidObjectId(videoId)) {
        throw new ApiError(401, "Not a valid videoId");
    }
    
    const videoInfo = await Video.findById(videoId);

    if(!videoInfo) {
        throw new ApiError(401, "Something went wrong while fetching the details of the video");
    }

    console.log(videoInfo.owner, req.user._id);

    if(videoInfo.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(401, "This User is not able to update the video");
    }

    const thumbnail = req.file.path;

    const video = await Video.findByIdAndUpdate (
        videoId,
        {
            $set: {
                thumbnail,
            }
        },
        {
            new: true,
        }
    );

    if(!video) {
        throw new ApiError(401, "Video not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Thumbnail updated successfully")
        );
});

const deleteVideo = asyncHandler (async (req, res) => {
    const { videoId } = req.params;

    if(!isValidObjectId(videoId)) {
        throw new ApiError(401, "Not a valid VideoId");
    }

    const videoInfo = await Video.findById(videoId);

    if(!videoInfo) {
        throw new ApiError(401, "Something went wrong while fetching the details of the video");
    }

    if(videoInfo.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(401, "This User is not able to delete the video");
    }

    const deleteVideo = await Video.findByIdAndDelete(videoId);

    if(!deleteVideo) {
        throw new ApiError(404, "Video cant be deleted because video is not present");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, deleteVideo, "Video Deleted Successfully")
        );
});

const togglePublishStatus = asyncHandler (async (req, res) => {
    const { videoId } = req.params;

    if(!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid videoId");
    }

    const videoInfo = await Video.findById(videoId);

    if(!videoInfo) {
        throw new ApiError(401, "Something went wrong while fetching the details of the video");
    }

    if(videoInfo.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(401, "This User is not able to delete the video");
    }

    const togglePublish = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !videoInfo.isPublished,
            }
        },
        {
            new: true,
        },
    );

    if(!togglePublish) {
        throw new ApiError(404, "Toggle of the video is not possible");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, togglePublish, "Toggle video has been done")
        );
});

const getAllVideos = asyncHandler (async (_, res) => {
    // const videosOfParticularUser = await Video.find({ owner: req?.user._id });
    
    // if(!videosOfParticularUser) {
    //     throw new ApiError(401, "No video found with this Id");
    // }

    const allVideos = await Video.find();

    if(!allVideos) {
        throw new ApiError(404, "Videos not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, allVideos, "Videos of a particular channel fetched successfully.")
        );
});

export { publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus, getAllVideos };