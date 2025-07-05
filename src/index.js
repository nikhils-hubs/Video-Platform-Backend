import dotenv from "dotenv"
import connectDB from "./db/db_connect.js"
import app from "./app.js"

// const port = process.env.PORT || 8000;

dotenv.config({
    path : "./env"
})
connectDB()
.then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`server is runing at ${PORT}`);
    });
})
.catch((err) => {
    console.log("MONGO db connection failed !!!", err);
});