import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js"
import { upload } from "../middlewares/multer.middleware.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { apiResponse } from "../utils/appResponse.js";

const registerUser = asyncHandler( async (req,res) => {
    //checking user never fill blank thing 
  const {fullName, email, password, userName} = req.body
    // console.log("email: ",email);
    
    if(fullName=== ""){
        throw new ApiError(400,"Full Name is required")
    }
    if(userName=== ""){
        throw new ApiError(400,"UserName is required")
    }
    if(password=== ""){
        throw new ApiError(400,"Password is required")
    }
    if(email=== ""){
        throw new ApiError(400,"Email  is required")
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
      const existedUser = User.findOne({
        $or: [{ email },{ userName }]
     })
     if(existedUser){
        throw new ApiError(409,"User Already Existed")
     }
// checking user sending avatar or cover image or not 
     const avatarLocalPath = req.files?.avatar[0]?.path;
     const coverImageLocalPath = req.files?.coverImage[0]?.path;

     if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
     }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar){
        throw new ApiError(408,"Avatar is required")
    }
// sending user data to db
    const user = await User.create({
        userName : userName.toLowerCase(),
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        fullName,
        password,
    })
//checking all data goes to db or not 
    const createdUser = await User.findById(user._id).select
    ("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering the user")
    }

    return res.status(201).json(
        new apiResponse(201,createdUser,"User register successfully")
    )
   

})
export { registerUser }