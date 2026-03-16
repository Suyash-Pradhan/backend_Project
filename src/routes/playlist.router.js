import { Router } from "express"
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist
} from "../controllers/playlist.controller.js"
import { verifyToken } from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validate.middleware.js";
import { playlistSchema } from "../validators/playlist.validator.js";

const router = Router()

// public reads
router.route("/user/:userId").get(getUserPlaylists)
router.route("/add/:videoId/:playlistId").patch(verifyToken, addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").patch(verifyToken, removeVideoFromPlaylist)
router.route("/:playlistId").get(getPlaylistById)

// protected writes
router.route("/").post(verifyToken, validate(playlistSchema), createPlaylist)
router.route("/:playlistId").patch(verifyToken, validate(playlistSchema), updatePlaylist)
router.route("/:playlistId").delete(verifyToken, deletePlaylist)

export default router
