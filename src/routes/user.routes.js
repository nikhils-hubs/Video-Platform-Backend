import { Router } from "express";
import { changedPassword, currentUser, loginUser, LogoutUser, refreshAccessToken, registerUser, updateAvatar, updateCoverImage, updateUserAccountDetail } from "../controllers/user.controllers.js";
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
router.route("/update-user-account-detail").post(updateUserAccountDetail)
router.route("update-avatar").post(updateAvatar)
router.route("update-cover-image").post(updateCoverImage)


export default router;