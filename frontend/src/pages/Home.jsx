import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import VideoCard from '../components/VideoCard'
import { getAllVideos } from '../api/video'

const CATEGORIES = ['All', 'Music', 'Gaming', 'News', 'Sports', 'Education', 'Comedy', 'Tech', 'Travel']

export default function Home() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('search') || ''
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [category, setCategory] = useState('All')

  useEffect(() => {
    setLoading(true)
    setError(false)
    getAllVideos({ query, page: 1, limit: 24, sortBy: 'createdAt', sortType: 'desc' })
      .then((res) => setVideos(res.data.data?.videos || res.data.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [query])

  return (
    <div>
      {/* Category pills */}
      {!query && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${category === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Search heading */}
      {query && (
        <h2 className="text-lg font-semibold mb-4">
          Results for <span className="text-gray-600">"{query}"</span>
        </h2>
      )}

      {/* States */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-xl mb-3" />
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-gray-500 text-lg font-medium">Something went wrong</p>
          <p className="text-gray-400 text-sm mt-1">Could not load videos. Is the backend running?</p>
        </div>
      )}

      {!loading && !error && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-lg font-medium">No videos yet</p>
          <p className="text-gray-400 text-sm mt-1">
            {query ? `No results for "${query}"` : 'Upload a video to get started!'}
          </p>
        </div>
      )}

      {!loading && !error && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
