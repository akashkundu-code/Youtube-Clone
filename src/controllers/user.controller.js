import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

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
  const avatarLocalPath = req.files?.avatar[0]?.path;
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
    throw new ApiError(400, "Avatar file is required");
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
  const { email, username, password } = req.body;

  //givu=ing error to validate both the fields are there
  if (!username || !email) {
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
  )
  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"user logged out succesfully"))
});

export { registerUser, loginUser, logoutUser };
