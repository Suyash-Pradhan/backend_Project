import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
    recordView,getMyVideos
} from "../controllers/video.controller.js"
import {verifyToken} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

import { validate } from "../middlewares/validate.middleware.js";
import { uploadVideoSchema, updateVideoSchema } from "../validators/video.validator.js";

const router = Router();

// Public routes
router.route('/view/:videoId').post(recordView)

router.use(verifyToken); // Apply verifyToken to all routes below

router.route('/mine').get(getMyVideos)

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        validate(uploadVideoSchema),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(
        upload.single("thumbnail"),
        validate(updateVideoSchema),
        updateVideo
    );
router.route('/toggle/publish/:videoId').patch(togglePublishStatus)


export default router