import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

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

  const { fullName, email, username, password } = req.body;
  console.log(fullName, email, username, password);

  //checking all the fields are there or not

  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //checking for existed user

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User aleady existed");
  }

  //avatar and images path
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage;
  [0]?.path;

  //check if the local path is there or not and then throw error

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  if (!coverImageLocalPath) {
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
    username: username.toLowerCase,
  })
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if(!createdUser){
    throw new ApiError(500,"somethhing went wrong while registering a user")
  }

  //return the response

  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered sucesfully")
  )


});

export { registerUser };
