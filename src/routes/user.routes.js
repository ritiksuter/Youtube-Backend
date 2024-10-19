import { Router } from "express";
import { getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshTokenRefreshing, registerUser, updateAccountDetails, updatePassword, updateUserAvatar, updateUserCoverImage } from "../controller/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1,
    },
    {
        name: "coverImage",
        maxCount: 1,
    },
]) ,registerUser);

userRouter.route("/login").post(loginUser);
userRouter.route("/logout").get(verifyJWT ,logoutUser);
userRouter.route("/refresh").get(verifyJWT, refreshTokenRefreshing);
userRouter.route("/update-password").patch(verifyJWT, updatePassword);
userRouter.route("/current-user").get(verifyJWT, getCurrentUser);
userRouter.route("/update-account").patch(verifyJWT, updateAccountDetails);
userRouter.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
userRouter.route("/update-coverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
userRouter.route("/channel-profile").patch(verifyJWT, getUserChannelProfile);
userRouter.route("/channel-watchHistory").patch(verifyJWT, getWatchHistory);

export { userRouter };