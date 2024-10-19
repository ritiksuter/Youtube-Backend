import { Router } from "express";
import { getChannelSubscribers, getChannelTotalLike, getChannelVideos } from "../controller/dashboard.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/videos").get(getChannelVideos);
router.route("/subscribers").get(getChannelSubscribers);
router.route("/likes").get(getChannelTotalLike);

export { router };