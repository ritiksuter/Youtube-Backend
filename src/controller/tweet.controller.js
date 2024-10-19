import { isValidObjectId } from "mongoose";
import { Tweet } from "../model/tweets.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler (async (req, res) => {
    const { content } = req.body;

    if(!content) {
        throw new ApiError(401, "Please provide the content");
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id,
    });

    if(!tweet) {
        throw new ApiError(500, "Server is not responding to the creation");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, tweet, "Tweet created successfully")
        );
});

const getUserTweets = asyncHandler (async (req, res) => {
    const { userId } = req.params;

    if(!isValidObjectId(userId)) {
        throw new ApiError(401, "Not a valid userId");
    }

    const findUserTweets = await Tweet.find({ owner: userId });

    if(!findUserTweets) {
        throw new ApiError(500, "Server error");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, findUserTweets, "Getting the users tweets by userId")
        );
});

const updateTweet = asyncHandler (async (req, res) => {
    const { tweetId } = req.params;

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(401, "Not a valid tweetId");
    }

    const tweetOwner = await Tweet.findById(tweetId);

    const { content } = req.body;

    if(!content) {
        throw new ApiError(401, "Please provide the content for the tweet");
    }

    if(req.user._id.toString() !== tweetOwner.owner.toString()) {
        throw new ApiError(401, "The tweet can only be updated through the original user");
    }

    const tweetUpdate = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content,
            }
        },
        {
            new: true,
        }
    );

    if(!tweetUpdate) {
        throw new ApiError(500, "Tweet can't be updated");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, tweetUpdate, "Tweet Updated successfully")
        );
});

const deleteTweet = asyncHandler (async (req, res) => {
    const { tweetId } = req.params;

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(401, "Not a valid tweetId");
    }

    const tweetOwner = await Tweet.findById(tweetId);

    if(!tweetOwner) {
        throw new ApiError(401, "There is no tweet with this id");
    }

    if(req.user._id.toString() !== tweetOwner.owner.toString()) {
        throw new ApiError(401, "The tweet can only be deleted through the original user");
    }

    const tweetDelete = await Tweet.findByIdAndDelete(tweetId);

    if(!tweetDelete) {
        throw new ApiError(500, "Something went wrong while deleting the twwet");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, tweetDelete, "Tweet Deleted successfully")
        );
});

const getAllTweets = asyncHandler (async (req, res) => {
    const allTweets = await Tweet.find({});

    if(!allTweets) {
        throw new ApiError(500, "All tweets cant be fetched");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, allTweets, "All tweets fetched successfully")
        );
});

export { getAllTweets, createTweet, getUserTweets, updateTweet, deleteTweet };