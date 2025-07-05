import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler( async (req,res) => {
    console.log("Register user endpoint hit!");
    console.log("Request body:", req.body);
    
    res.status(200).json({
        success: true,
        message: "Register endpoint working!",
        data: req.body,
    })
});

export { registerUser };