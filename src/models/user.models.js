import mongoose, {Schema} from "mongoose";
import brycpt from "brycpt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            
        },
        fullName: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
            required: true,
        },
        watchHistory: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        password: {
            type: String,
            required: [true,"Password is REQUIRED"]
        },
        refreshToken: {
            type: String,
        },
    }
,{timestamps: true})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password = await brycpt.hash(this.password,10);
    next();
})

userSchema.method.isPasswordCorrect = async function(password){
    return await brycpt.compare(password,this.password);
}

userSchema.model.generateAccessToken = function()   
{
    return jwt.sign(
        {
        _id: this._id,
        email: this.email,
        username: this.username,
        },
            process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}
userSchema.method.generateRefreshToken = function()
{
    return jwt.sign(
        {
        _id: this._id,
        },
            process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}

export const User = mongoose.model("User",userSchema);