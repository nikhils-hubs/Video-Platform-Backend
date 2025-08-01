import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MONGODB connected !! at DB host ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MONGODB Connection Error: ",error);
        process.exit(1);
    }
}
export default connectDB;