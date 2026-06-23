# Deploying VidTube

The app has two parts that deploy separately:

- **Backend** (Express API) → **Render**
- **Frontend** (React/Vite) → **Vercel**

Deploy the **backend first** so you have its URL to give the frontend.

---

## 1. Backend → Render

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**.
2. Connect your GitHub repo `Youtube-Clone`.
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Add **Environment Variables** (from your local `backend/.env`):

   | Key | Value |
   |---|---|
   | `PORT` | `8000` |
   | `MONGODB_URI` | your MongoDB Atlas connection string |
   | `ACCESS_TOKEN_SECRET` | (same as local) |
   | `ACCESS_TOKEN_EXPIRY` | `1d` |
   | `REFRESH_TOKEN_SECRET` | (same as local) |
   | `REFRESH_TOKEN_EXPIRY` | `10d` |
   | `CLOUDINARY_CLOUD_NAME` | (same as local) |
   | `CLOUDINARY_API_KEY` | (same as local) |
   | `CLOUDINARY_API_SECRET` | (same as local) |
   | `NODE_ENV` | `production` |
   | `CORS_ORIGIN` | _(leave blank for now — fill in after step 2)_ |

5. Click **Create Web Service**. When it's live you'll get a URL like
   `https://vidtube-backend.onrender.com`.
6. **MongoDB Atlas:** Network Access → allow `0.0.0.0/0` (or Render's IPs) so
   Render can connect.

> Free Render services sleep after ~15 min idle and take ~30s to wake on the
> next request — normal for the free tier.

---

## 2. Frontend → Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → import the same GitHub repo.
2. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
3. Add **Environment Variable**:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://YOUR-RENDER-URL.onrender.com/api/v1` |

   (Use the backend URL from step 1, **with** the `/api/v1` suffix.)
4. **Deploy.** You'll get a URL like `https://vidtube.vercel.app`.

---

## 3. Connect the two (CORS)

1. Back in **Render** → your service → **Environment** → set:

   | Key | Value |
   |---|---|
   | `CORS_ORIGIN` | `https://vidtube.vercel.app` |

   (Your exact Vercel URL. Multiple origins allowed, comma-separated.)
2. Save — Render redeploys automatically.

---

## 4. Seed the production database (optional)

To populate the live DB with the same dummy data, run locally pointed at the
**same** `MONGODB_URI` you gave Render:

```bash
cd backend
npm run seed
```

(They share the same Atlas cluster, so seeding once is enough.)

---

## Done

Visit your Vercel URL. Log in with a seeded account (`techguru@example.com` /
`Password123`) or register a new one.

### Troubleshooting
- **Login works but you're logged out on refresh:** confirm `NODE_ENV=production`
  on Render (needed for cross-site cookies) and that both URLs are HTTPS.
- **CORS error in console:** `CORS_ORIGIN` on Render must exactly match the
  Vercel URL (no trailing slash).
- **Network error / 404 on API calls:** check `VITE_API_URL` includes `/api/v1`.
