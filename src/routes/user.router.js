import {Router} from 'express';
import { loginUser, logoutuser, registerUser,refreshacessToken } from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name:'avatar',
            maxCount:1
        },
        {
            name:'coverImage',
            maxCount:1
        }
    ]),
    registerUser)
//secrete routes
router.route('/login').post(loginUser)
router.route('/logout').post(verifyToken,logoutuser)
router.route('/refresh-token').post(refreshacessToken)

export default router;          