import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../model/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "Invalid channelId");
    }

    const subscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId,
    });

    if (subscription) {
        await Subscription.findByIdAndDelete(subscription?._id);
        return res
            .status(200)
            .json(
                new ApiResponse(200, { subscription: null }, "Unsubscribed Successfully")
            );
    }

    else {
        const newSubscriber = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId,
        });

        return res
            .status(200)
            .json(
                new ApiResponse(200, newSubscriber, "Subscribed successfully")
            );
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(401, "Invalid channelId");
    }

    const subscribers = await Subscription.find({ channel: channelId });

    // const subscribers = await Subscription.aggregate([
    //     {
    //         $match: {
    //             channel: new mongoose.Types.ObjectId(channelId),
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "users",
    //             localField: "subscriber",
    //             foreignField: "_id",
    //             as: "subscribersCount",
    //         }
    //     },
    //     {
    //         $addFields: {
    //             totalSubscribers: {
    //                 $size: "$subscribersCount",
    //             }
    //         }
    //     },
    //     {
    //         $project: {
    //             totalSubscribers: 1,
    //         }
    //     }
    // ]);

    if (!subscribers) {
        throw new ApiError(404, "Channel not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribers, "Fetched Subscriber of the channel successfully")
        );
});

const getSubscribedChannel = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(401, "Inavalid subscriberId");
    }

    // const subscribedTo = await Subscription.find( { subscriber: subscriberId } );

    const subscribedTo = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            }
        },
        {
            $group: {
                _id: "$subscriber",
                totalChannelSubscribed: {
                    $sum: 1,
                }
            }
        },
        {
            $project: {
                totalChannelSubscribed: 1,
            }
        }
    ]);

    if (!subscribedTo) {
        throw new ApiError(404, "Something went wrong while fetching details");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribedTo, "Subscribed Channels fetched successfully")
        );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannel };