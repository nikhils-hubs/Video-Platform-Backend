import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import { ApiError } from "./utils/ApiError.js";



const app = express();

app.get("/api/v1/test", (req, res) => {
  res.send("hello");
})

// Middleware setup
app.use(cors({
  origin: process.env.ORIGIN_CORS, // or your frontend origin
  credentials: true
}));
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

const createVersionRoute = (route, version = "v1") => "/api/" + version + "/" + route;


/**
 * Error Handing
 */
app.use((err, req, res, next) => {
  console.log(err);

  if (err?.statusCode) {
    return res.status(err.statusCode || 500).json(err);
  }

  return res
    .status(err?.statusCode || 500)
    .json(
      new ApiError(err.statusCode || 500, "An error occurred", err.message)
    );
});

/**
 * 404 errors
 */
app.use("/*splat", (req, res) => {
  return res.status(404).json(new ApiError(404, "Page not found"));
});

//improting routes

// Routes
app.use("/api/v1/user", userRouter);


export default app;
