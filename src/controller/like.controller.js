import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../model/likes.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../model/video.model.js";
import { Comment } from "../model/comments.model.js";
import { Tweet } from "../model/tweets.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(401, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(404, "Video not found");
    }

    const existedLike = await Like.findOne({
        $and: [{video: videoId}, {likedBy: req?.user._id}],
    });

    if (existedLike) {
        await Like.findByIdAndDelete(existedLike?._id);
    }

    else {
        const like = await Like.create({
            video: videoId,
            likedBy: req?.user._id,
        });

        if (!like) {
            throw new ApiError(500, "Something went wrong while liking the video");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, like, "Liked Successfully")
            );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Disliked successfully")
        );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(401, "Invalid commentId");
    }

    const comment = await Comment.findById(commentId);

    if(!comment) {
        throw new ApiError(404, "Comment not found");
    }

    const existedLike = await Like.findOne({
        $and: [{comment: commentId}, {likedBy: req?.user._id}],
    });

    if (existedLike) {
        await Like.findByIdAndDelete(existedLike?._id);
    }

    else {
        const like = await Like.create({
            comment: commentId,
            likedBy: req?.user._id,
        });

        if (!like) {
            throw new ApiError(500, "Something went wrong while liking the comment");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, like, "Liked Successfully")
            );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Disliked successfully")
        );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(401, "Invalid videoId");
    }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    const existedLike = await Like.findOne({
        $and: [{tweet: tweetId}, {likedBy: req?.user._id}],
    });

    if (existedLike) {
        await Like.findByIdAndDelete(existedLike?._id);
    }

    else {
        const like = await Like.create({
            tweet: tweetId,
            likedBy: req?.user._id,
        });

        if (!like) {
            throw new ApiError(500, "Something went wrong while liking the tweet");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, like, "Liked Successfully")
            );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Disliked successfully")
        );
});

const getLikedVideos = asyncHandler (async (req, res) => {
    const allLikedVideos = await Like.find({ likedBy: req.user._id });

    if(!allLikedVideos) {
        throw new ApiError(404, "Something went wrong, Liked videos not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, allLikedVideos, "Fetched all liked videos successfully.")
        );
});

export { toggleVideoLike, toggleTweetLike, getLikedVideos, toggleCommentLike };