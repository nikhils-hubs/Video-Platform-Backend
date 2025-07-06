import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";


const app = express();

// Middleware setup
app.use(cors({
  origin: "http://localhost:3000", // or your frontend origin
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

//improting routes
import userRouter from "./routes/user.routes.js";
// Routes
app.use("/api/v1/users", userRouter);


export default app;
