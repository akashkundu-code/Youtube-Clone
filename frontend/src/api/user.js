import api from './axiosInstance'

export const getChannelProfile = (username) => api.get(`/users/c/${username}`)

export const getWatchHistory = () => api.get('/users/history')

export const updateAvatar = (formData) =>
  api.patch('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const updateCoverImage = (formData) =>
  api.patch('/users/cover-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

export const updateAccountDetails = (data) => api.patch('/users/account-update', data)

export const changePassword = (data) => api.post('/users/change-password', data)
