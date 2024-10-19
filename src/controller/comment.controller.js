import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../model/comments.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../model/video.model.js";

const addComments = asyncHandler (async (req, res) => {
    const { videoId } = req.params;

    if(!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid VideoId");
    }

    const { content } = req.body;

    if(!content) {
        throw new ApiError(401, "Please provide the content for the video");
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(404, "Video not found");
    }

    const comment = await Comment.create({
        content: content,
        video: videoId,
        owner: req.user._id,
    });

    if(!comment) {
        throw new ApiError(500, "Something went wrong while sending the comment");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, comment, "Comment added successfully to the video")
        );
});

const updateComment = asyncHandler (async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if(!content) {
        throw new ApiError(401, "Please provide content for the comment");
    }

    if(!isValidObjectId(commentId)) {
        throw new ApiError(401, "Invalid commentId");
    }

    const comment = await Comment.findById(commentId);

    if(!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if(req.user._id.toString() !== comment.owner.toString()) {
        throw new ApiError(401, "Only comment owner can update the comment");
    }

    const commentUpdate = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content,
            }
        }
    );

    if(!commentUpdate) {
        throw new ApiError(500, "Something went wrong while updating the comment");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, commentUpdate, "Comment Updated successfully")
        );
});

const deleteComment = asyncHandler (async (req, res) => {
    const { commentId } = req.params;

    if(!isValidObjectId(commentId)) {
        throw new ApiError(401, "Invalid commentId");
    }

    const comment = await Comment.findById(commentId);

    if(!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if(req?.user._id.toString() !== comment.owner.toString()) {
        throw new ApiError(401, "Only the video owner or the comment owner can delete the comment");
    }

    const commentDelete = await Comment.findByIdAndDelete(commentId);

    if(!commentDelete) {
        throw new ApiError(500, "Something went wrong while deleting the comment");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, commentDelete, "Comment Deleted Successfully")
        );
});

const getVideoComments = asyncHandler (async (req, res) => {
    const { videoId } = req.params;

    if(!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(404, "Video not found");
    }

    const findComments = await Comment.find({ video: videoId });

    if(!findComments) {
        throw new ApiError(500, "Some error occured in fetching the comments of a particular video")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, findComments, "Comments of a video fetched successfully")
        );
});

export { addComments, updateComment, deleteComment, getVideoComments };