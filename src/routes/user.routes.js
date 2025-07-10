import { Router } from "express";
import { 
    changedPassword, 
    currentUser, 
    getUserChannelProfile, 
    loginUser, 
    LogoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAvatar, 
    updateCoverImage, 
    updateUserAccountDetail, 
    userWatchHistory } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]) 
    ,registerUser
)
router.route("/login").post(loginUser)
//secured route

router.route("/logout").post(verifyJwt, LogoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJwt, changedPassword)
router.route("/curent-user").post(verifyJwt ,currentUser)
router.route("/update-user-account-detail").patch(verifyJwt,updateUserAccountDetail)
router.route("/update-avatar").patch(verifyJwt,upload.single("avatar"),updateAvatar)
router.route("/update-cover-image").patch(verifyJwt,upload.single("coverImage"),updateCoverImage)
router.route("/c/:userName").get(verifyJwt,getUserChannelProfile)
router.route("/histroy").get(verifyJwt,userWatchHistory)


export default router;