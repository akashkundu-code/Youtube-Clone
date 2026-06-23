import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getVideoById } from '../api/video'
import { toggleVideoLike } from '../api/like'
import { useAuth } from '../context/AuthContext'
import CommentSection from '../components/CommentSection'

function formatViews(n) {
  if (!n) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${n}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function VideoPlayer() {
  const { videoId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [liking, setLiking] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)

  useEffect(() => {
    if (!videoId) return
    setLoading(true)
    getVideoById(videoId)
      .then((res) => {
        setVideo(res.data.data)
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [videoId])

  const handleLike = async () => {
    if (!user) { navigate('/login'); return }
    setLiking(true)
    try {
      const res = await toggleVideoLike(videoId)
      setLiked(res.data.data?.isLiked)
    } catch {}
    setLiking(false)
  }

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto animate-pulse">
        <div className="aspect-video bg-gray-200 rounded-xl mb-4" />
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
    )
  }

  if (!video) return null

  const owner = video.owner || {}

  return (
    <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-6">
      {/* Left: Video + Info */}
      <div className="flex-1 min-w-0">
        {/* Video player */}
        <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
          {video.videoFile ? (
            <video
              src={video.videoFile}
              controls
              autoPlay
              className="w-full h-full"
              poster={video.thumbnail}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold mb-2 leading-snug">{video.title}</h1>

        {/* Channel + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <Link to={`/channel/${owner.username}`} className="flex items-center gap-3 group">
            {owner.avatar ? (
              <img src={owner.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                {owner.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <p className="font-semibold text-sm group-hover:text-blue-600 transition-colors">{owner.fullName || owner.username}</p>
              <p className="text-xs text-gray-500">@{owner.username}</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${liked ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
            >
              <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              {liked ? 'Liked' : 'Like'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Description box */}
        <div
          className="mt-4 bg-gray-100 rounded-xl p-4 cursor-pointer"
          onClick={() => setDescExpanded((v) => !v)}
        >
          <p className="text-sm font-semibold mb-1">
            {formatViews(video.views)} views · {formatDate(video.createdAt)}
          </p>
          <p className={`text-sm whitespace-pre-wrap ${descExpanded ? '' : 'line-clamp-3'}`}>
            {video.description || 'No description.'}
          </p>
          <button className="text-sm font-semibold mt-1 hover:text-gray-600">
            {descExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>

        {/* Comments */}
        <CommentSection videoId={videoId} />
      </div>

      {/* Right: Sidebar (empty for now — would show related videos) */}
      <aside className="hidden lg:block w-80 flex-shrink-0">
        <div className="sticky top-20">
          <p className="text-sm text-gray-400 text-center py-8 bg-gray-50 rounded-xl">
            Related videos will appear here once the video listing API is fully implemented.
          </p>
        </div>
      </aside>
    </div>
  )
}
