import dotenv from "dotenv"
import connectDB from "./db/db_connect.js"
import app from "./app.js"
import router from "./routes/user.routes.js"

// const port = process.env.PORT || 8000;

connectDB()
.then(() => {
    const PORT = process.env.PORT || 3000;
    // console.log("APP:", app);
    // app.listen(PORT, () => {
    //     console.log(`server is runing at ${PORT}`);
    // });
    // app.use("/api/v1/users",router);
    console.log("About to start server...");

    app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);

});

console.log("After listen...");
})
.catch((err) => {
    console.log("MONGO db connection failed !!!", err);
});