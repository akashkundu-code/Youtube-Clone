import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getChannelStats, getChannelVideos } from '../api/dashboard'
import { togglePublishStatus, deleteVideo } from '../api/video'
import { useAuth } from '../context/AuthContext'

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold">{value ?? '-'}</p>
        <p className="text-gray-500 text-sm mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function formatViews(n) {
  if (!n) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${n}`
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [videos, setVideos] = useState([])
  const [pagination, setPagination] = useState({})
  const [statsLoading, setStatsLoading] = useState(true)
  const [videosLoading, setVideosLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    getChannelStats()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false))
  }, [])

  useEffect(() => {
    setVideosLoading(true)
    getChannelVideos({ page, limit: 10, sortBy: 'createdAt', sortType: 'desc' })
      .then((res) => {
        setVideos(res.data.data?.videos || [])
        setPagination(res.data.data?.pagination || {})
      })
      .catch(() => {})
      .finally(() => setVideosLoading(false))
  }, [page])

  const handleTogglePublish = async (videoId) => {
    try {
      await togglePublishStatus(videoId)
      setVideos((prev) =>
        prev.map((v) => (v._id === videoId ? { ...v, isPublished: !v.isPublished } : v))
      )
    } catch {}
  }

  const handleDelete = async (videoId) => {
    if (!confirm('Delete this video? This cannot be undone.')) return
    try {
      await deleteVideo(videoId)
      setVideos((prev) => prev.filter((v) => v._id !== videoId))
    } catch {}
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Channel Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back, {user?.fullName}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/channel/${user?.username}`}
            className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            View channel
          </Link>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-xl mb-3" />
              <div className="h-8 bg-gray-200 rounded w-16 mb-1" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Videos"
            value={stats?.totalVideos}
            color="bg-purple-100 text-purple-600"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
          />
          <StatCard
            label="Total Views"
            value={formatViews(stats?.totalViews)}
            color="bg-blue-100 text-blue-600"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
          />
          <StatCard
            label="Total Likes"
            value={stats?.totalLikes}
            color="bg-red-100 text-red-600"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>}
          />
          <StatCard
            label="Subscribers"
            value={formatViews(stats?.totalSubscribers)}
            color="bg-green-100 text-green-600"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
        </div>
      )}

      {/* Videos table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold">Your Videos</h2>
          <span className="text-sm text-gray-500">{pagination.totalVideos || 0} total</span>
        </div>

        {videosLoading ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                <div className="w-24 h-14 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-center text-gray-500">
            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="font-medium">No videos uploaded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {videos.map((video) => (
              <div key={video._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <Link to={`/video/${video._id}`} className="flex-shrink-0">
                  <div className="w-24 h-14 bg-gray-200 rounded-lg overflow-hidden">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/video/${video._id}`} className="font-medium text-sm line-clamp-1 hover:text-blue-600 transition-colors">
                    {video.title}
                  </Link>
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    <span>{formatViews(video.views)} views</span>
                    <span>{video.likeCount || 0} likes</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => handleTogglePublish(video._id)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors
                      ${video.isPublished
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {video.isPublished ? 'Published' : 'Private'}
                  </button>
                  <button
                    onClick={() => handleDelete(video._id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    aria-label="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {(pagination.hasPrevPage || pagination.hasNextPage) && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPrevPage}
              className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNextPage}
              className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
