import api from './axiosInstance'

export const registerUser = (formData) =>
  api.post('/users/register', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const loginUser = (data) => api.post('/users/login', data)

export const logoutUser = () => api.post('/users/logout')

export const refreshToken = () => api.post('/users/refresh-token')

export const getCurrentUser = () => api.get('/users/current-user')
