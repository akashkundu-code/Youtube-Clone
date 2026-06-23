import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getChannelProfile } from '../api/user'
import { useAuth } from '../context/AuthContext'
import VideoCard from '../components/VideoCard'

function formatSubscribers(n) {
  if (!n) return '0 subscribers'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M subscribers`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K subscribers`
  return `${n} subscriber${n !== 1 ? 's' : ''}`
}

export default function Channel() {
  const { username } = useParams()
  const { user } = useAuth()
  const [channel, setChannel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Videos')
  const tabs = ['Videos', 'About']

  useEffect(() => {
    if (!username) return
    setLoading(true)
    getChannelProfile(username)
      .then((res) => setChannel(res.data.data))
      .catch(() => setChannel(null))
      .finally(() => setLoading(false))
  }, [username])

  if (loading) {
    return (
      <div className="animate-pulse max-w-screen-xl mx-auto">
        <div className="h-40 bg-gray-200 rounded-xl mb-4" />
        <div className="flex gap-4 items-center px-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
        </div>
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-gray-500 text-lg font-medium">Channel not found</p>
        <Link to="/" className="mt-4 text-blue-600 hover:underline text-sm">Go home</Link>
      </div>
    )
  }

  const isOwn = user?.username === username

  return (
    <div className="max-w-screen-xl mx-auto">
      {/* Cover image */}
      <div className="h-36 md:h-48 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl overflow-hidden mb-4">
        {channel.coverImage && (
          <img src={channel.coverImage} alt="Cover" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Channel info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 px-4 pb-4 border-b border-gray-200">
        {channel.avatar ? (
          <img src={channel.avatar} alt={channel.username} className="w-20 h-20 rounded-full border-4 border-white object-cover -mt-10 flex-shrink-0 shadow" />
        ) : (
          <div className="w-20 h-20 rounded-full border-4 border-white bg-red-600 flex items-center justify-center text-white text-2xl font-bold -mt-10 flex-shrink-0 shadow">
            {channel.username?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{channel.fullName}</h1>
          <p className="text-gray-500 text-sm">@{channel.username}</p>
          <div className="flex gap-3 text-sm text-gray-500 mt-0.5">
            <span>{formatSubscribers(channel.subscribersCount)}</span>
            <span>·</span>
            <span>{channel.channelsSubscribedToCount || 0} subscriptions</span>
          </div>
        </div>
        <div className="flex gap-2">
          {isOwn ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              Manage Channel
            </Link>
          ) : (
            <button
              className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors
                ${channel.isSubscribed
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  : 'bg-gray-900 text-white hover:bg-gray-700'}`}
            >
              {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 px-4 mt-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px
              ${activeTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-6 px-4">
        {activeTab === 'Videos' && (
          <div>
            {channel.videos && channel.videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {channel.videos.map((video) => (
                  <VideoCard key={video._id} video={{ ...video, owner: channel }} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 font-medium">No videos yet</p>
                {isOwn && (
                  <p className="text-gray-400 text-sm mt-1">Upload your first video from the Dashboard</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'About' && (
          <div className="max-w-xl space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Channel details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{formatSubscribers(channel.subscribersCount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{channel.email}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
