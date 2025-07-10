import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/appResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Video } from "../models/videos.models.js";

const generateAccessTokenandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const AccessToken = user.generateAccessToken()
        const RefreshToken = user.generateRefreshToken()

        user.refreshToken = RefreshToken;
        await user.save({ validateBeforeSave: false })

        return { AccessToken, RefreshToken }

    } catch (error) {
        throw ApiError(500, "something went wrong while generate Tokens")
    }

}
// registerUser
const registerUser = asyncHandler(async (req, res) => {
    //checking user never fill blank thing 
    const { fullName, email, password, userName } = req.body
    // console.log("email: ",email);

    if (fullName === "") {
        throw new ApiError(400, "Full Name is required")
    }
    if (userName === "") {
        throw new ApiError(400, "UserName is required")
    }
    if (password === "") {
        throw new ApiError(400, "Password is required")
    }
    if (email === "") {
        throw new ApiError(400, "Email  is required")
    }


    // if
    // (
    //     [fullName, email, password, userName].some((field) => 
    //       field?.trim()===""
    //     )
    // ){
    //     throw new ApiError(409,"All fields are required")
    // }

    //finding if user have already acc or not
    const existedUser = await User.findOne({
        $or: [{ email }, { userName }]
    })
    if (existedUser) {
        throw new ApiError(409, "User Already Existed")
    }
    // checking user sending avatar or cover image or not 
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //  const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(coverImageLocalPath) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(408, "Avatar is required")
    }
    // sending user data to db
    const user = await User.create({
        userName: userName.toLowerCase(),
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        fullName,
        password,
    })
    //checking all data goes to db or not 
    const createdUser = await User.findById(user._id).select
        ("-password -RefreshToken -avatar -coverImage")

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res.status(201).json(
        new apiResponse(201, createdUser, "User register successfully")
    )


})

//LoginUser
const loginUser = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body;
    if (!(email || userName)) {
        throw new ApiError(409, "username and password is required")
    }
    const user = await User.findOne({
        $or: [{ email }, { userName }]
    })
    if (!user) {
        throw new ApiError(409, "User does not exist")
    }
    const isPasswordVaild = await user.isPasswordCorrect(password)
    if (!isPasswordVaild) {
        throw new ApiError(401, "password is INVAILD")
    }

    const { AccessToken, RefreshToken } = await generateAccessTokenandRefreshToken(user._id)
    const LoggedInUser = await User.findById(user._id)
        .select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("AccessToken", AccessToken, options)
        .cookie("RefreshToken", RefreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: LoggedInUser, AccessToken, RefreshToken
                },
                "User logIN sucessfully"
            )
        )
})

// Logout User
const LogoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                RefreshToken: undefined
            }
        },
        {
            new: true,
        }
    )
    const options = {
        httpOnly: true,
        secure: false,
    }
    return res
        .status(200)
        .clearCookie(AccessToken, options)
        .clearCookie(RefreshToken, options)
        .json(new apiResponse(
            200,
            {},
            "logout sucessfully"
        ))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.RefreshToken || req.body.RefreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "RefreshToken not found")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "invaild request")
        }
        if (incomingRefreshToken !== user.RefreshToken) {
            throw new ApiError(401, "refresh token is invaild or used")
        }
        const { AccessToken, newRefreshToken } = await generateAccessTokenandRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true,
        }
        return res
            .status(200)
            .cookie("AccessToken", AccessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new apiResponse(
                    200,
                    {
                        AccessToken,
                        refreshToken: newRefreshToken,
                    },
                    "new refresh Token created sucessfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "something went wrong while genrating access token")
    }

})

const changedPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(409, "error while using user")
    }
    const ispasswordReal = await isPasswordCorrect(oldPassword);
    if (!ispasswordReal) {
        throw new ApiError(400, "password is incorrect")
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    if (!(newPassword == confPassword)) {
        throw new ApiError(401, "confirm pasword is incorrect")
    }
    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {},
                "Password is changed successfully"
            )
        )

})

const currentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                req.user,
                "checked successfully"
            )
        )

})
const updateUserAccountDetail = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    if (!(fullName || email)) {
        throw new ApiError(400, "fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
            }
        },
        { new: true }
    ).select("-password")
    return res
        .status(200)
        .json(new apiResponse(
            200, user, "Details updated successfully"
        ))
})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on Cloudinary")
    }

    const userAvatar = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new apiResponse(
            200, userAvatar, "Avatar updated sucessfully"
        ))
})

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on Cloudinary")
    }

    const userCoverImage = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new apiResponse(
            200, userCoverImage, "coverImage updated sucessfully"
        ))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { userName } = req.params
    if (!userName) {
        throw new ApiError(401, "username is missing")
    }

    try {
        const channel = await User.aggregate([
            {
                $match: {
                    userName: userName?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"

                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscriberCount:
                    {
                        $size: "$subscribers"
                    },
                    channelSubscribedToCount:
                    {
                        $size: "$subscribedTo"
                    },
                    isSubsribed: {
                        $cond: {
                            if: { $in: [req.user?._id, $subscribers.subscribers] },
                            then: true,
                            else: false,
                        }
                    }

                }
            },
            {
                $project: {
                    fullName: 1,
                    userName: 1,
                    email: 1,
                    avatar: 1,
                    coverImage: 1,
                    subscriberCount: 1,
                    channelSubscribedToCount: 1,
                    isSubsribed: 1
                }
            }
        ])
    } catch (error) {
        if (!channel?.length) {
            throw new ApiError(401, error?.message || "channel not found")
        }
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                channel[0],
                "User channel recieved successfully"
            )
        )
})

const userWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistroy",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        userName: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
            }
        }
    
    ])
    if (!user) {
        throw new ApiError(401,"something went wrong while fetching the watch histroy")
    }
    return res
    .status(200)
    .json(new apiResponse(
        200,
        user[0].watchHistory,
        "watchHistory feteched successfully"
    ))

})

export {
    registerUser,
    loginUser,
    LogoutUser,
    refreshAccessToken,
    changedPassword,
    currentUser,
    updateUserAccountDetail,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    userWatchHistory
}