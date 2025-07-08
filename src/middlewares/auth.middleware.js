import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


const verifyJwt = asyncHandler( async (res, req, next) => {
    try {
        const Token = req.cookies?.AccessToken || req.get("Authorization")?.replace("Bearer ","")
        if (!Token) {
            throw new ApiError(401,"Unauthorized Request")
        }
        const decodeToken = await jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401,"INVAILD AccessToken")
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "INVAILD ACCESSTOKEN")
    }
    
})
export { verifyJwt }