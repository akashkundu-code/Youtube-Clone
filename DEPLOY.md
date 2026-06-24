# Deploying VidTube

The app has two parts that deploy as **two separate Vercel projects** from the
same GitHub repo:

- **Backend** (Express API) → Vercel project #1, root directory `backend`
- **Frontend** (React/Vite) → Vercel project #2, root directory `frontend`

> ⚠️ **Upload size limit on Vercel:** Vercel caps request bodies at ~4.5 MB, so
> uploads must stay small (fine for images/thumbnails and short clips, not full
> videos). If you later need large video uploads, host the **backend on Render**
> instead — see the alternative at the bottom.

Deploy the **backend first** so you have its URL for the frontend.

---

## 1. Backend → Vercel (project #1)

1. Go to [vercel.com/new](https://vercel.com/new) → import your `Youtube-Clone` repo.
2. Configure:
   - **Root Directory:** `backend`
   - **Framework Preset:** Other
   - Leave build/output empty (the `vercel.json` + `api/` folder handle it)
3. Add **Environment Variables** (from your local `backend/.env`):

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | your MongoDB Atlas connection string |
   | `ACCESS_TOKEN_SECRET` | (same as local) |
   | `ACCESS_TOKEN_EXPIRY` | `1d` |
   | `REFRESH_TOKEN_SECRET` | (same as local) |
   | `REFRESH_TOKEN_EXPIRY` | `10d` |
   | `CLOUDINARY_CLOUD_NAME` | (same as local) |
   | `CLOUDINARY_API_KEY` | (same as local) |
   | `CLOUDINARY_API_SECRET` | (same as local) |
   | `CORS_ORIGIN` | _(leave blank for now — set after step 2)_ |

   (`NODE_ENV` is automatically `production` on Vercel — no need to add it.)
4. **Deploy.** You'll get a URL like `https://vidtube-backend.vercel.app`.
5. Quick check: visit `https://vidtube-backend.vercel.app/api/v1/healthcheck`
   — it should return `{"...","message":"OK","success":true}`.
6. **MongoDB Atlas:** Network Access → allow `0.0.0.0/0` so Vercel can connect.

---

## 2. Frontend → Vercel (project #2)

1. [vercel.com/new](https://vercel.com/new) → import the **same** repo again.
2. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
3. Add **Environment Variable**:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://vidtube-backend.vercel.app/api/v1` |

   (Your backend URL from step 1, **with** the `/api/v1` suffix.)
4. **Deploy.** You'll get a URL like `https://vidtube.vercel.app`.

---

## 3. Connect the two (CORS)

1. Open the **backend** Vercel project → **Settings → Environment Variables**.
2. Set:

   | Key | Value |
   |---|---|
   | `CORS_ORIGIN` | `https://vidtube.vercel.app` |

   (Your exact frontend URL, no trailing slash.)
3. **Redeploy** the backend project (Deployments → ⋯ → Redeploy) so the new
   variable takes effect.

---

## 4. Seed the database (optional)

To fill the live DB with dummy data, run locally against the **same**
`MONGODB_URI` you gave Vercel:

```bash
cd backend
npm run seed
```

---

## Done

Visit your frontend URL. Log in with a seeded account
(`techguru@example.com` / `Password123`) or register a new one.

### Troubleshooting
- **Logged out after refresh:** both URLs must be HTTPS (they are on Vercel).
  Confirm `CORS_ORIGIN` exactly matches the frontend URL.
- **CORS error in console:** `CORS_ORIGIN` must match the frontend URL exactly
  (no trailing slash); redeploy the backend after changing it.
- **Network error / 404 on API calls:** `VITE_API_URL` must include `/api/v1`.
- **Upload fails with 413 / large file:** that's the Vercel 4.5 MB body limit —
  use a smaller file or move the backend to Render (below).

---

## Alternative: backend on Render (for large video uploads)

If you need real video uploads (up to 50 MB), host the backend on Render
instead of Vercel — Render has no small body limit and runs the app as a
normal always-on server (`npm start`).

1. [dashboard.render.com](https://dashboard.render.com) → New → Web Service →
   your repo.
2. **Root Directory** `backend`, **Build** `npm install`, **Start** `npm start`.
3. Add the same env vars as above, plus `NODE_ENV=production`.
4. Point the frontend's `VITE_API_URL` at the Render URL + `/api/v1`, and set
   `CORS_ORIGIN` to your frontend URL.

(The `api/` folder and `vercel.json` are ignored by Render — the same codebase
works on both hosts.)
