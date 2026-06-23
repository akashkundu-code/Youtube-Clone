import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
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
        await axios.post('/api/v1/users/refresh-token', {}, { withCredentials: true })
        return api(original)
      } catch {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
