import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getSubscribedChannel, getUserChannelSubscribers, toggleSubscription } from "../controller/subscription.controller.js";

const subscriptionRouter = Router();

subscriptionRouter.use(verifyJWT);

subscriptionRouter.route("/c/:channelId").post(toggleSubscription);
subscriptionRouter.route("/u/:channelId").get(getUserChannelSubscribers);
subscriptionRouter.route("/c/:subscriberId").get(getSubscribedChannel);

export { subscriptionRouter };