import { isValidObjectId } from "mongoose";
import { Video } from "../model/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../model/subscription.model.js";

const getChannelVideos = asyncHandler (async (req, res) => {
    const userId = req.user._id;

    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User Id");
    }

    // const channelVideos = await Video.aggregate([
    //     {
    //         $match: {
    //             owner: req.user._id,
    //         },
    //     },
    //     {
    //         $lookup: {
    //             from: "users",
    //             localField: "owner",
    //             foreignField: "_id",
    //             as: "allVideos",
    //         }
    //     },
    //     {
    //         $addFields: {
    //             totalVideo: {
    //                 $size: "$allVideos",
    //             }
    //         },
    //     },
    //     {
    //         $project: {
    //             totalVideo: 1,
    //             title: 1,
    //         }
    //     },
    // ]);

    const channelVideos = await Video.find({ owner: userId });

    if(!channelVideos) {
        throw new ApiError(404, "No video found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channelVideos, "All video of the user fetched successfully")
        );
});

const getChannelSubscribers = asyncHandler (async (req, res) => {
    // const totalSubscribers = await Subscription.aggregate([
    //     {
    //         $match: {
    //             channel: req.user._id,
    //         }
    //     },
    //     {
    //         $group: {
    //             _id: "$channel",
    //             totalSubscriber: {
    //                 $sum: 1,
    //             }
    //         }
    //     },
    //     {
    //         $project: {
    //             totalSubscriber: 1
    //         }
    //     }
    // ]);

    const totalSubscribers = await Subscription.find({ channel: req.user._id });

    if(!totalSubscribers) {
        throw new ApiError(500, "Something went wrong while fetching total number of subscribers");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, totalSubscribers, "Getting the total subscribers of the channel.")
        );
});

const getChannelTotalLike = asyncHandler (async (req, res) => {
    const totalLikes = await Video.aggregate([
        {
            $match: {
                owner: req.user._id,
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "totalLikes",
            }
        },
        {
            $addFields: {
                totalLikes: {
                    $size: "$totalLikes"
                }
            }
        },
        {
            $project: {
                totalLikes:1,
            }
        },
    ]);

    if(!totalLikes) {
        throw new ApiError(500, "Something went wrong while fetching the total likes of a particular channel");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, totalLikes, "Total likes of the channel fetched successfully.")
        );
})

export { getChannelVideos, getChannelSubscribers, getChannelTotalLike };