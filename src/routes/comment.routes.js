import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { addComments, deleteComment, getVideoComments, updateComment } from "../controller/comment.controller.js";

const commentRouter = Router();

commentRouter.use(verifyJWT);

commentRouter.route("/:videoId").post(addComments);
commentRouter.route("/:videoId").get(getVideoComments);
commentRouter.route("/c/:commentId").patch(updateComment);
commentRouter.route("/c/:commentId").delete(deleteComment);

export { commentRouter };