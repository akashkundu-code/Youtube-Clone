import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

const extractToken = (req) =>
  req.cookies?.accessToken ||
  req.header("Authorization")?.replace(/^Bearer\s+/i, "");

export const verifyJWT = asyncHandler(async(req,res,next)=>{
   try {
     const token = extractToken(req)
     if(!token){
         throw new ApiError(401,"Unauthorized request")
     }

    const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if(!user){
     throw new ApiError(401,"Invalid Access Token")
    }
    req.user = user;
    next()
   } catch (error) {
    throw new ApiError(401,error?.message ||  "invalid access token")
   }

})

// Sets req.user when a valid token is present, but never blocks the request.
// Used for public endpoints that still want to personalize when logged in.
export const optionalVerifyJWT = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (user) req.user = user;
  } catch {
    // ignore invalid token — treat as anonymous
  }
  next();
});
