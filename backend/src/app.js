import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// CORS_ORIGIN may be "*" (dev) or a comma-separated list of allowed origins
// (prod). With credentials we must reflect the specific origin rather than
// send a literal "*", so we validate against the list and echo it back.
const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  //we use use for middleware
  cors({
    origin: function (origin, callback) {
      // allow same-origin / curl / server-to-server (no Origin header)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "16kb",
  })
); // form
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
); //url
app.use(express.static("public"));
app.use(cookieParser());

//import routes

import userRouter from "./routes/user.routes.js"; //we can inport it like this just because it is done in default
import healthcheckRouter from "./routes/healthcheck.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";


//routes declaration

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);

//http://localhost:8000/api/v1/user/register

// Global error handler — converts thrown ApiError (and any error) into a
// consistent JSON shape the frontend can read, instead of Express' default HTML.
import { ApiError } from "./utils/apiErrors.js";
import multer from "multer";

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  let error = err;

  // Multer rejections (oversize file, too many files, bad type) -> 400
  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "File too large. Max 50MB for video, 5MB for images."
        : error.message;
    error = new ApiError(400, message);
  }

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    error = new ApiError(statusCode, error.message || "Internal Server Error");
  }

  if (process.env.NODE_ENV !== "production") {
    console.error("ERROR:", error.message);
  }

  return res.status(error.statusCode).json({
    statusCode: error.statusCode,
    success: false,
    message: error.message,
    errors: error.errors || [],
    data: null,
  });
});


export { app };
