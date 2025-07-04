import dotenv from "dotenv"
import connectDB from "./db/db_connect.js"
import app from "./app.js"

dotenv.config({
    path : "./env"
})
connectDB()
.then(() => {
    console.log("Database connected successfully")
})
.catch((err) => {
    console.log("Database connection failed", err);
    
})