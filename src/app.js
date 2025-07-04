import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin : process.env.ORIGIN_CORS,
    credentials: true,
}))
app.use(express.json({limit: "16kb"})); // FOR JSON FILE TO GO ON REQ.BODY
app.use(express.urlencoded({limit: "16kb"})); // FOR DATA COMING FROM URL
app.use(express.static("public")); // VALUEABLE ASSESTS IN PUBLIC FILE
app.use(cookieParser()); // KEEPING THE INFO IN USER BROWSER


export default app;