import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // Get channel stats for the authenticated user
  const channelId = req.user._id;

  // Aggregate channel statistics
  const channelStats = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
        totalLikes: { $sum: { $size: "$likes" } },
        totalSubscribers: { $first: { $size: "$subscribers" } },
      },
    },
    {
      $project: {
        _id: 0,
        totalVideos: 1,
        totalViews: 1,
        totalLikes: 1,
        totalSubscribers: 1,
      },
    },
  ]);

  // If no videos found, return default stats
  const stats =
    channelStats.length > 0
      ? channelStats[0]
      : {
          totalVideos: 0,
          totalViews: 0,
          totalLikes: 0,
          totalSubscribers: 0,
        };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // Get all videos uploaded by the authenticated user's channel
  const channelId = req.user._id;
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;

  // Build sort object
  const sortOrder = sortType === "desc" ? -1 : 1;
  const sortObj = {};
  sortObj[sortBy] = sortOrder;

  // Get channel videos with aggregation
  const channelVideos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        thumbnail: 1,
        videoFile: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        likesCount: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $sort: sortObj,
    },
    {
      $skip: (parseInt(page) - 1) * parseInt(limit),
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  // Get total count for pagination
  const totalVideos = await Video.countDocuments({ owner: channelId });

  // Calculate pagination info
  const totalPages = Math.ceil(totalVideos / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  const result = {
    videos: channelVideos,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalVideos,
      hasNextPage,
      hasPrevPage,
      limit: parseInt(limit),
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
