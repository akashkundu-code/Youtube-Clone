import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

//this method generate access and refresh token from model
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while geneating access and referesh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  /*get user detail from frontend using frontend
  validation - not empty
  check if user is loged in or not : check username or email
  check for images, check for avatar
  upload them to clodinary , avatar
  create user object - create entry in db
  remove password and refresh token field from response
  check for user creation
  return response*/

  //fetching user data

  console.log("req.body:", req.body);
  console.log("req.files:", req.files);

  // Check if req.body exists
  if (!req.body) {
    throw new ApiError(
      400,
      "Request body is missing. Make sure you're sending form data correctly."
    );
  }

  const { fullName, email, username, password } = req.body;

  //checking all the fields are there or not

  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //checking for existed user

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User aleady existed");
  }
  // console.log(req.files);

  //avatar and images path
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  //check if the local path is there or not and then throw error

  if (!avatarLocalPath) {
    throw new ApiError(
      400,
      "Avatar file is required. Make sure you're uploading the avatar as a FILE in Postman, not as TEXT."
    );
  }

  //upload to cloudinary

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //create user object - create entry in db

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "somethhing went wrong while registering a user");
  }

  //return the response

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered sucesfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //input the field
  //check the email or username is there or not
  //find the user
  //password check
  //access and refresh token
  //send cookie

  //taking the input from user at once
  // console.log("Login - req.body:", req.body);
  // console.log("Login - req.headers:", req.headers);

  // Check if req.body exists
  if (!req.body) {
    throw new ApiError(
      400,
      "Request body is missing. Make sure you're sending JSON data correctly."
    );
  }

  const { email, username, password } = req.body;

  //givu=ing error to validate both the fields are there
  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  //finding the user by username or email $or => is monogodb operator
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  //throwing error if no user found
  if (!user) {
    throw new ApiError(404, "User doesnot exist");
  }

  //checking password is correct or now and we are doing it like this because of bycrypt
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "Password is incorrect");
  }

  //generating accestoken and refresh token by methord we made
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const logedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    //used for cookiee
    httpOnly: true,
    secure: true,
  };

  // returning the result
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: logedInUser,
          accessToken,
          refreshToken,
        },
        "User Logedin Succesfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out succesfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorised Request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Old Password Incorrect");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "all fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true } //this line helps to return the new user
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated succesfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is missing");
  }

  // Get the current user to get the old avatar URL before updating
  const currentUser = await User.findById(req.user?._id);
  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }
  const oldAvatarUrl = currentUser.avatar;

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(401, "Error while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  // Delete the old avatar from cloudinary after successful update
  if (oldAvatarUrl) {
    const oldAvatarPublicId = extractPublicIdFromUrl(oldAvatarUrl);
    if (oldAvatarPublicId) {
      await deleteFromCloudinary(oldAvatarPublicId);
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  // Get the current user to get the old cover image URL before updating
  const currentUser = await User.findById(req.user?._id);
  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }
  const oldCoverImageUrl = currentUser.coverImage;

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(401, "Error while uploading cover image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  // Delete the old cover image from cloudinary after successful update
  if (oldCoverImageUrl) {
    const oldCoverImagePublicId = extractPublicIdFromUrl(oldCoverImageUrl);
    if (oldCoverImagePublicId) {
      await deleteFromCloudinary(oldCoverImagePublicId);
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
};
