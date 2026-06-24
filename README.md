# VidTube

A full-stack YouTube-like video platform built with React, Node.js, Express, and MongoDB.

**Live demo:** https://youtube-clone-ihyu.vercel.app

---

## Features

- Browse and search videos without signing in
- JWT-based authentication (register, login, persistent sessions)
- Upload videos with thumbnails (MP4, WebM, MOV — up to 4.5 MB on Vercel)
- Like videos and comments
- Subscribe to channels
- Comment on videos
- Channel pages with subscriber counts and video lists
- Creator dashboard with stats (views, likes, subscribers) and video management
- Watch history
- Profile settings — change avatar, cover image, name, email, password
- Responsive design for mobile and desktop

---

## Tech Stack

**Frontend**
- React 19 + Vite 8
- Tailwind CSS v4
- React Router v7
- Axios with auto-refresh interceptor

**Backend**
- Node.js + Express 5 (ES Modules)
- MongoDB + Mongoose
- JWT access & refresh tokens
- Cloudinary (video + image storage)
- Multer (file uploads)

**Infrastructure**
- Vercel (frontend + backend, two separate projects)
- MongoDB Atlas

---

## Local Development

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster
- A Cloudinary account

### 1. Clone the repo

```bash
git clone https://github.com/akashkundu-code/Youtube-Clone.git
cd Youtube-Clone
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env   # fill in the values below
npm run dev
```

**`backend/.env` variables:**

```
PORT=8000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net
ACCESS_TOKEN_SECRET=your_secret_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_other_secret_here
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:5173
```

### 3. Seed dummy data (optional)

```bash
cd backend
npm run seed
```

This creates 6 users, 12 videos, comments, likes, and subscriptions.

Test login: `techguru@example.com` / `Password123`

### 4. Set up the frontend

```bash
cd frontend
npm install
# Create frontend/.env with:
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
npm run dev
```

Open http://localhost:5173.

---

## Project Structure

```
Youtube-Clone/
├── backend/
│   ├── api/
│   │   └── index.js          # Vercel serverless entry point
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # Express routers
│   │   ├── middleware/       # Auth, multer, error handling
│   │   ├── utils/            # Cloudinary, ApiError, ApiResponse
│   │   └── db/               # MongoDB connection
│   └── vercel.json
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios API functions
│   │   ├── components/       # Navbar, Sidebar, VideoCard, CommentSection
│   │   ├── context/          # AuthContext
│   │   └── pages/            # Home, VideoPlayer, Channel, Dashboard, etc.
│   └── vercel.json
└── DEPLOY.md                 # Full deployment guide
```

---

## Deployment

See [DEPLOY.md](DEPLOY.md) for the full guide. The short version:

1. Deploy `backend/` as Vercel project #1 with your env vars
2. Deploy `frontend/` as Vercel project #2 with `VITE_API_URL=<backend-url>/api/v1`
3. Set `CORS_ORIGIN=<frontend-url>` on the backend project and redeploy

---

## API Overview

All endpoints are under `/api/v1`.

| Resource | Endpoints |
|---|---|
| Auth | `POST /users/register`, `POST /users/login`, `POST /users/logout` |
| Videos | `GET /videos`, `POST /videos`, `GET /videos/:id`, `PATCH /videos/:id`, `DELETE /videos/:id` |
| Comments | `GET /comments/:videoId`, `POST /comments/:videoId`, `PATCH /comments/c/:id`, `DELETE /comments/c/:id` |
| Likes | `POST /likes/toggle/v/:videoId`, `POST /likes/toggle/c/:commentId`, `GET /likes/videos` |
| Subscriptions | `POST /subscriptions/c/:channelId`, `GET /subscriptions/c/:channelId` |
| Dashboard | `GET /dashboard/stats`, `GET /dashboard/videos` |
| Playlists | `GET /playlist/:id`, `POST /playlist`, `PATCH /playlist/:id`, `DELETE /playlist/:id` |

---

## Upload Limits

Vercel caps request bodies at ~4.5 MB. For larger video uploads, host the backend on [Render](https://render.com) instead — see DEPLOY.md for instructions.
