import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  //we use use for middleware
  cors({
    origin: process.env.CORS_ORIGIN,
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

//routes

import userRouter from "./routes/user.routes.js"; //we can inport it like this just because it is done in default

//routes declaration

app.use("/api/v1/users", userRouter);

export { app };
