import mongoose from "mongoose";
import { User } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken';

const options = {
    httpOnly: true,
    secure: true,
}


const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullName } = req.body;

    if ([username, email, password, fullName].some((fields) => fields?.trim() === "")) {
        throw new ApiError(401, "All the fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existedUser) {
        throw new ApiError(401, "User already exists");
    }

    const avatarLocalPath = req?.files.avatar[0].path;
    const coverImageLocalPath = req?.files.coverImage[0].path;

    if (!avatarLocalPath) {
        throw new ApiError(401, "Avatar Image is required");
    }

    if (!coverImageLocalPath) {
        throw new ApiError(401, "Cover Image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(401, "No avatar file is uploaded in the cloud");
    }

    if (!coverImage) {
        throw new ApiError(401, "No cover image file is uploaded in the cloud");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage.url,
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User registerd successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, password, email } = req.body;

    if ([username, password, email].some(field => field?.trim() === "")) {
        throw new ApiError(401, "Please enter the username, password and email of the user");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(401, "There is no registered user with this email or username");
    }

    const passwordCheck = await user.isPasswordCorrect(password);

    if (!passwordCheck) {
        throw new ApiError(401, "Password in not correct for this registered user");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    if (!accessToken) {
        throw new ApiError(401, "No Access Token is generated while performing the database operation");
    }

    if (!refreshToken) {
        throw new ApiError(401, "No Access Token is generated while performing the database operation");
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, user, "User logged in successfully")
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            }
        },
        {
            new: true,
        }
    );

    if (!user) {
        throw new ApiError(404, "User is not present with this id");
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User Logged out successfully")
        );
});

const refreshTokenRefreshing = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        throw new ApiError(401, "Refresh Token not found");
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    if (!decodedToken) {
        throw new ApiError(401, "Decoded Token is not present");
    }

    const user = await User.findById(decodedToken?._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (token !== user?.refreshToken) {
        throw new ApiError(401, "Refresh Token is expired or used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    if (!accessToken) {
        throw new ApiError(401, "Access Token cant be generated");
    }

    if (!refreshToken) {
        throw new ApiError(401, "Refresh Token cant be generated");
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { accessToken, refreshToken }, "Refreshed the user login")
        );
});

const updatePassword = asyncHandler(async (req, res) => {
    const { oldPasssword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!oldPasssword || !newPassword) {
        throw new ApiError(401, "Password are not given by the user");
    }

    const passwordCheck = await user.isPasswordCorrect(oldPasssword);

    if (!passwordCheck) {
        throw new ApiError(401, "Please enter the valid old Password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Password updated successfully")
        );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "This is the current user")
        );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { email, username } = req.body;

    if (!email) {
        throw new ApiError(401, "You have not entered the email for the user to be updated");
    }

    if (!username) {
        throw new ApiError(401, "You have not entered the username for the user to be updated");
    }

    const updateAccount = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                email,
                username,
            }
        },
        {
            new: true,
        }
    );

    if (!updateAccount) {
        throw new ApiError(404, "Updated Account not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updateAccount, "Account updated successfully")
        );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file.path;

    if (!avatarLocalPath) {
        throw new ApiError(401, "Please provide the avatar image");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(401, "Avatar image is not successfully uploaded in cloudinary");
    }

    const updateAvatar = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true,
        }
    );

    if (!updateAvatar) {
        throw new ApiError(404, "Updated Avatar not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updateAvatar, "Avatar updated successfully")
        );
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file.path;

    if (!coverImageLocalPath) {
        throw new ApiError(401, "Please provide the Cover image");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage) {
        throw new ApiError(401, "Cover image is not successfully uploaded in cloudinary");
    }

    const updateCoverImage = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true,
        }
    );

    if (!updateCoverImage) {
        throw new ApiError(404, "Updated Cover Image not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updateCoverImage, "Cover Image updated successfully")
        );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.body;

    const isUsernamePresent = await User.findOne({ username });

    if (!isUsernamePresent) {
        throw new ApiError(401, "No user is present with this username");
    }

    if (!username.trim()) {
        throw new ApiError(401, "Username is not defined");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo",
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers",
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    }
                }
            }
        },
        {
            $project: {
                username: 1,
                email: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
            }
        },
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "User channel fetched successfully")
        );
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                        }
                    },
                ]
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(200, user[0].watchHistory, "Watch History fetched Successfully")
        );
});

export { getWatchHistory, getUserChannelProfile, updateUserCoverImage, updateUserAvatar, updateAccountDetails, getCurrentUser, registerUser, loginUser, logoutUser, refreshTokenRefreshing, updatePassword };