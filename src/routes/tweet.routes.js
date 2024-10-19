import { Router } from "express";
import { createTweet, deleteTweet, getAllTweets, getUserTweets, updateTweet } from "../controller/tweet.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const tweetRouter = Router();

tweetRouter.use(verifyJWT);

tweetRouter.route("/").post(createTweet);
tweetRouter.route("/user/:userId").get(getUserTweets);
tweetRouter.route("/:tweetId").patch(updateTweet);
tweetRouter.route("/:tweetId").delete(deleteTweet);
tweetRouter.route("/").get(getAllTweets);

export { tweetRouter };