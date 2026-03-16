import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyToken} from "../middlewares/auth.middleware.js"

import { validate } from "../middlewares/validate.middleware.js";
import { commentSchema } from "../validators/comment.validator.js";

const router = Router();
router.use(verifyToken);

// Match frontend API calls: /api/v1/comments/:videoId
router.route("/:videoId").get(getVideoComments).post(validate(commentSchema), addComment);
router.route("/c/:commentId").delete(deleteComment).patch(validate(commentSchema), updateComment);

export default router
