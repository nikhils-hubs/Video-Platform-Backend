import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videofile: {
            type: String, // cloudinary url
            required: true,
        },
        title: {
            type: String, 
            required: true,
        },
        description: {
            type: String, 
            required: true,
        },
        thumbnail: {
            type: String, // cloudinary url
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        isPublished: {
            type: Boolean,
            default: true,
        }
    }
,{timestamps: true,})

videoSchema.plugin(mongooseAggregatePaginate);
const Video = mongoose.model("Video",videoSchema);
export {Video}