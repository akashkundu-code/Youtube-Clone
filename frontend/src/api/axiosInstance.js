import axios from 'axios'

// In dev, leave VITE_API_URL unset and requests go through Vite's proxy to
// /api/v1. In production set VITE_API_URL to the deployed backend, e.g.
// https://your-backend.onrender.com/api/v1
const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
})

const SKIP_REFRESH = ['/users/current-user', '/users/refresh-token', '/users/login', '/users/register']

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    const isSkipped = SKIP_REFRESH.some((url) => original.url?.includes(url))
    if (err.response?.status === 401 && !original._retry && !isSkipped) {
      original._retry = true
      try {
        await axios.post(`${API_BASE}/users/refresh-token`, {}, { withCredentials: true })
        return api(original)
      } catch {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
