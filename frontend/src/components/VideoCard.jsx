import { Link } from 'react-router-dom'

function formatDuration(seconds) {
  if (!seconds) return ''
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatViews(n) {
  if (!n) return '0 views'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K views`
  return `${n} views`
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

export default function VideoCard({ video }) {
  const owner = video.ownerDetails || video.owner || {}

  return (
    <Link to={`/video/${video._id}`} className="group block">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200 rounded-xl overflow-hidden mb-3">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
        {video.duration && (
          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex gap-3">
        <Link to={`/channel/${owner.username}`} onClick={(e) => e.stopPropagation()}>
          {owner.avatar ? (
            <img src={owner.avatar} alt={owner.username} className="w-9 h-9 rounded-full object-cover mt-0.5 flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold mt-0.5 flex-shrink-0">
              {owner.username?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </Link>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-1">{video.title}</h3>
          <Link
            to={`/channel/${owner.username}`}
            className="text-gray-600 text-xs hover:text-black"
            onClick={(e) => e.stopPropagation()}
          >
            {owner.fullName || owner.username || 'Unknown'}
          </Link>
          <p className="text-gray-600 text-xs">
            {formatViews(video.views)} · {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  )
}
