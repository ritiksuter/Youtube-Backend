import { Router } from "express";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controller/playlist.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const playlistRouter = Router();

playlistRouter.use(verifyJWT);

playlistRouter.route("/").post(createPlaylist);
playlistRouter.route("/user/:userId").get(getUserPlaylists);
playlistRouter.route("/:playlistId").get(getPlaylistById);
playlistRouter.route("/:playlistId").delete(deletePlaylist);
playlistRouter.route("/:playlistId").patch(updatePlaylist);
playlistRouter.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
playlistRouter.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

export { playlistRouter };