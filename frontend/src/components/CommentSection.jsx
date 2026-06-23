import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getVideoComments, addComment, updateComment, deleteComment } from '../api/comment'
import { Link } from 'react-router-dom'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function CommentItem({ comment, currentUser, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const isOwner = currentUser && comment.owner?._id === currentUser._id

  const handleUpdate = async () => {
    if (!editText.trim()) return
    await onUpdate(comment._id, editText)
    setEditing(false)
  }

  return (
    <div className="flex gap-3 py-3">
      <Link to={`/channel/${comment.owner?.username}`}>
        {comment.owner?.avatar ? (
          <img src={comment.owner.avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {comment.owner?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold">@{comment.owner?.username}</span>
          <span className="text-xs text-gray-500">{timeAgo(comment.createdAt)}</span>
        </div>
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full border-b border-gray-400 outline-none resize-none text-sm py-1"
              rows={2}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditing(false)} className="px-3 py-1 text-sm rounded-full hover:bg-gray-100">Cancel</button>
              <button onClick={handleUpdate} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700">Save</button>
            </div>
          </div>
        ) : (
          <p className="text-sm">{comment.content}</p>
        )}
        {isOwner && !editing && (
          <div className="flex gap-3 mt-1">
            <button onClick={() => setEditing(true)} className="text-xs text-gray-500 hover:text-black">Edit</button>
            <button onClick={() => onDelete(comment._id)} className="text-xs text-gray-500 hover:text-red-600">Delete</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CommentSection({ videoId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [focused, setFocused] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!videoId) return
    getVideoComments(videoId)
      .then((res) => setComments(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [videoId])

  const handleAdd = async () => {
    if (!newComment.trim()) return
    try {
      const res = await addComment(videoId, newComment)
      setComments((prev) => [res.data.data, ...prev])
      setNewComment('')
      setFocused(false)
    } catch {}
  }

  const handleUpdate = async (commentId, content) => {
    try {
      const res = await updateComment(commentId, content)
      setComments((prev) => prev.map((c) => (c._id === commentId ? { ...c, content: res.data.data.content } : c)))
    } catch {}
  }

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c._id !== commentId))
    } catch {}
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-4">{comments.length} Comments</h3>

      {/* Add comment */}
      {user && (
        <div className="flex gap-3 mb-6">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onFocus={() => setFocused(true)}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full border-b border-gray-300 focus:border-black outline-none py-1 text-sm bg-transparent"
            />
            {focused && (
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => { setFocused(false); setNewComment('') }}
                  className="px-3 py-1.5 text-sm rounded-full hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newComment.trim()}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Comment
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comment list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUser={user}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
