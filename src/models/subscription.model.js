import mongoose, {Schema} from "mongoose";
import { User } from "./user.models.js";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: User
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: User
    }
},{timestamps: true})
const Subscription = mongoose.model("Subscription",subscriptionSchema)
export {Subscription};