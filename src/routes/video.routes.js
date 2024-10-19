import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controller/video.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const videoRouter = Router();

videoRouter.use(verifyJWT);

videoRouter.route("/").post(upload.fields([
    {
        name: "videoFile",
        maxCount: 1,
    },
    {
        name: "thumbnail",
        maxCount: 1,
    },
]), publishAVideo);

videoRouter.route("/:videoId").get(getVideoById);
videoRouter.route("/:videoId").patch(upload.single("thumbnail"), updateVideo);
videoRouter.route("/:videoId").delete(deleteVideo);
videoRouter.route("/toggle/publish/:videoId").patch(togglePublishStatus);
videoRouter.route("/").get(getAllVideos);

export { videoRouter };