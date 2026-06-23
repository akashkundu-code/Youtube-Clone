import api from './axiosInstance'

export const getChannelStats = () => api.get('/dashboard/stats')

export const getChannelVideos = (params = {}) => api.get('/dashboard/videos', { params })
