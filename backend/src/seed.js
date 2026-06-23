/**
 * Database seeder — populates the DB with dummy users, videos, comments,
 * likes, subscriptions, tweets and playlists so the app has content to show.
 *
 * Run from the backend folder:  npm run seed
 *
 * Videos use Google's public sample-video bucket so they actually play.
 * Avatars/thumbnails use free placeholder image services.
 *
 * Every seeded user shares the password:  Password123
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./db/index.js";

import { User } from "./models/user.models.js";
import { Video } from "./models/video.model.js";
import { Comment } from "./models/comment.models.js";
import { Like } from "./models/like.models.js";
import { Subscription } from "./models/subscription.models.js";
import { Tweet } from "./models/tweet.models.js";
import { Playlist } from "./models/playlist.models.js";

dotenv.config({ path: "./.env" });

const PASSWORD = "Password123";

const avatar = (n) => `https://i.pravatar.cc/300?img=${n}`;
const cover = (seed) => `https://picsum.photos/seed/${seed}/1280/320`;
const thumb = (seed) => `https://picsum.photos/seed/${seed}/640/360`;

// Public, hot-linkable sample MP4s (Google sample bucket)
const SAMPLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
];

const USERS = [
  { username: "techguru", fullName: "tech guru", email: "techguru@example.com", img: 12 },
  { username: "musicmania", fullName: "music mania", email: "music@example.com", img: 5 },
  { username: "traveldiaries", fullName: "travel diaries", email: "travel@example.com", img: 32 },
  { username: "codecraft", fullName: "code craft", email: "code@example.com", img: 51 },
  { username: "foodiehub", fullName: "foodie hub", email: "food@example.com", img: 16 },
  { username: "gamerzone", fullName: "gamer zone", email: "gamer@example.com", img: 60 },
];

const VIDEO_TEMPLATES = [
  { title: "Big Buck Bunny — Full Short Film", description: "A classic open-source animated short. Sit back and enjoy this beautifully rendered tale of a giant rabbit.", category: "Animation" },
  { title: "Building a REST API with Node.js & Express", description: "Step-by-step tutorial on building a production-ready REST API. Covers routing, middleware, auth and MongoDB.", category: "Tech" },
  { title: "10 Hidden Gems in Southeast Asia", description: "Off-the-beaten-path travel destinations you have to visit. Hidden beaches, temples and street food.", category: "Travel" },
  { title: "Lo-Fi Beats to Code / Relax To", description: "One hour of chill lo-fi hip-hop beats. Perfect background music for studying, coding or relaxing.", category: "Music" },
  { title: "The Ultimate Pasta Carbonara Recipe", description: "Authentic Italian carbonara in under 15 minutes. Just eggs, pancetta, pecorino and pepper — no cream!", category: "Food" },
  { title: "Elephants Dream — Open Movie Project", description: "The world's first open-source animated film. A surreal journey through a strange mechanical world.", category: "Animation" },
  { title: "React Hooks Explained in 20 Minutes", description: "useState, useEffect, useContext and custom hooks — everything you need to know to master React Hooks.", category: "Tech" },
  { title: "Speedrunning the Classics — Live Gameplay", description: "Watch a full speedrun attempt with commentary, tips and tricks for beating your personal best.", category: "Gaming" },
  { title: "Tears of Steel — Sci-Fi Short", description: "A blockbuster-quality sci-fi short film made with open-source tools. Robots, action and visual effects.", category: "Film" },
  { title: "Sintel — Award-Winning Animation", description: "A lonely girl searches for a dragon she befriended. Stunning visuals and an emotional story.", category: "Animation" },
  { title: "Reviewing the 2024 Hot Hatchback", description: "An in-depth review and test drive. Performance, interior, tech and whether it's worth the price.", category: "Auto" },
  { title: "Going on a Bullrun — Road Trip Vlog", description: "Join us on an epic cross-country road trip. Supercars, scenery and unforgettable moments.", category: "Travel" },
];

const COMMENTS = [
  "This is exactly what I was looking for, thanks!",
  "Great content, subscribed!",
  "Could you make a follow-up video on this?",
  "The quality keeps getting better. Well done 🔥",
  "First time here and I'm impressed.",
  "Watched this twice already, so good.",
  "Underrated channel, deserves way more views.",
  "Helped me a lot with my project 🙏",
  "The editing on this is top notch.",
  "Who's watching this in 2026?",
];

const TWEETS = [
  "Just uploaded a new video — go check it out!",
  "Hit 1K subscribers today, thank you all ❤️",
  "What should I make a video about next?",
  "Behind the scenes of my latest shoot was wild.",
  "Coffee + editing = my whole weekend.",
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seed = async () => {
  await connectDB();

  console.log("🧹 Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Video.deleteMany({}),
    Comment.deleteMany({}),
    Like.deleteMany({}),
    Subscription.deleteMany({}),
    Tweet.deleteMany({}),
    Playlist.deleteMany({}),
  ]);

  // --- Users ---
  console.log("👤 Creating users...");
  const createdUsers = [];
  for (const u of USERS) {
    // Use .create so the pre-save hook hashes the password
    const user = await User.create({
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      password: PASSWORD,
      avatar: avatar(u.img),
      coverImage: cover(u.username),
    });
    createdUsers.push(user);
  }

  // --- Videos ---
  console.log("🎬 Creating videos...");
  const createdVideos = [];
  VIDEO_TEMPLATES.forEach((t, i) => {
    createdVideos.push({
      title: t.title,
      description: t.description,
      videoFile: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
      thumbnail: thumb(i + 1),
      duration: randInt(120, 900),
      views: randInt(500, 250000),
      isPublished: true,
      owner: createdUsers[i % createdUsers.length]._id,
      createdAt: new Date(Date.now() - randInt(0, 60) * 86400000),
    });
  });
  const videos = await Video.insertMany(createdVideos);

  // --- Subscriptions (each user subscribes to a few others) ---
  console.log("🔔 Creating subscriptions...");
  const subs = [];
  for (const subscriber of createdUsers) {
    for (const channel of createdUsers) {
      if (subscriber._id.equals(channel._id)) continue;
      if (Math.random() < 0.5) {
        subs.push({ subscriber: subscriber._id, channel: channel._id });
      }
    }
  }
  await Subscription.insertMany(subs);

  // --- Comments + Likes on videos ---
  console.log("💬 Creating comments & likes...");
  const comments = [];
  const likes = [];
  for (const video of videos) {
    const numComments = randInt(2, 5);
    for (let c = 0; c < numComments; c++) {
      comments.push({
        content: rand(COMMENTS),
        video: video._id,
        owner: rand(createdUsers)._id,
      });
    }
    // Random video likes from distinct users
    const likers = createdUsers.filter(() => Math.random() < 0.6);
    for (const liker of likers) {
      likes.push({ video: video._id, likedby: liker._id });
    }
  }
  await Comment.insertMany(comments);
  await Like.insertMany(likes);

  // --- Tweets ---
  console.log("🐦 Creating tweets...");
  const tweets = [];
  for (const user of createdUsers) {
    const n = randInt(1, 3);
    for (let i = 0; i < n; i++) {
      tweets.push({ content: rand(TWEETS), owner: user._id });
    }
  }
  await Tweet.insertMany(tweets);

  // --- Playlists ---
  console.log("📂 Creating playlists...");
  for (const user of createdUsers) {
    const owned = videos.filter((v) => v.owner.equals(user._id));
    if (owned.length) {
      await Playlist.create({
        name: "My Favorites",
        description: `${user.fullName}'s favorite uploads`,
        owner: user._id,
        videos: owned.map((v) => v._id),
      });
    }
  }

  // --- Watch history ---
  console.log("📺 Populating watch history...");
  for (const user of createdUsers) {
    const watched = videos
      .filter(() => Math.random() < 0.4)
      .map((v) => v._id);
    await User.findByIdAndUpdate(user._id, { watchHistory: watched });
  }

  console.log("\n✅ Seeding complete!");
  console.log("────────────────────────────────────");
  console.log(`   Users:         ${createdUsers.length}`);
  console.log(`   Videos:        ${videos.length}`);
  console.log(`   Subscriptions: ${subs.length}`);
  console.log(`   Comments:      ${comments.length}`);
  console.log(`   Likes:         ${likes.length}`);
  console.log(`   Tweets:        ${tweets.length}`);
  console.log("────────────────────────────────────");
  console.log("\n🔑 Login with any of these (password: Password123):");
  USERS.forEach((u) => console.log(`   • ${u.username}  /  ${u.email}`));
  console.log("");

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
