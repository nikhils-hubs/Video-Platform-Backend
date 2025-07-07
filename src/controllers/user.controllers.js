import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js"
import { upload } from "../middlewares/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/appResponse.js";

const generateAccessTokenandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const AccessToken = user.generateAccessToken()
        const RefreshToken = user.generateRefreshToken()

        user.refreshToken = RefreshToken;
        await user.save({ validateBeforeSave: false })

        return{ AccessToken, RefreshToken }

    } catch (error) {
        throw ApiError(500,"something went wrong while generate Tokens")
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
const loginUser = asyncHandler( async (req, res) => {
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
        throw new ApiError(401,"password is INVAILD")
    }

    const {AccessToken, RefreshToken} = await generateAccessTokenandRefreshToken(user._id)
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
const LogoutUser = asyncHandler( async (req,res)=> {
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
export {
    registerUser,
    loginUser,
    LogoutUser,
}