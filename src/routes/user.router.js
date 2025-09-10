import { Router } from 'express';
import {
    registerUser,
    loginUser,
    logoutuser,
    refreshacessToken,
    chnagePassword,
    chnageuserDetails,
    changeAvatar,
    changeCoverImage,
    getcurrentuser,
    getchannelDetails,
    getWatchHistory,
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: 'coverImage',
            maxCount: 1
        }
    ]),
    registerUser)
//secrete routes
router.route('/login').post(loginUser)
router.route('/logout').post(verifyToken, logoutuser)
router.route('/refresh-token').post(refreshacessToken)
router.route('/change-password').post(verifyToken, chnagePassword)
router.route('/account-update').patch(verifyToken, chnageuserDetails)
router.route('/avatar').patch(verifyToken, upload.single("avatar"), changeAvatar)
router.route('/cover-image').patch(verifyToken, upload.single("coverImage"), changeCoverImage)
router.route('/current-user').get(verifyToken, getcurrentuser)
router.route('/channel/:username').get(verifyToken, getchannelDetails)
router.route('/history').get(verifyToken, getWatchHistory)

export default router;          