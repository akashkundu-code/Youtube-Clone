import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { publishVideo } from '../api/video'

export default function UploadVideo() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '' })
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [thumbPreview, setThumbPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const videoRef = useRef()
  const thumbRef = useRef()

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleVideo = (e) => {
    const file = e.target.files?.[0]
    if (file) setVideoFile(file)
  }

  const handleThumb = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnail(file)
      setThumbPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required')
      return
    }
    if (!videoFile) { setError('Please select a video file'); return }
    if (!thumbnail) { setError('Please select a thumbnail image'); return }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('videoFile', videoFile)
      fd.append('thumbnail', thumbnail)
      const res = await publishVideo(fd)
      navigate(`/video/${res.data.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Upload Video</h1>
      <p className="text-gray-500 text-sm mb-6">Share your video with the world</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Video file dropzone */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Video file *</label>
          <button
            type="button"
            onClick={() => videoRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center transition-colors bg-gray-50"
          >
            <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {videoFile ? (
              <span className="text-sm font-medium text-gray-800">{videoFile.name}</span>
            ) : (
              <>
                <span className="text-sm font-medium text-gray-700">Click to select a video</span>
                <span className="text-xs text-gray-400 mt-1">MP4, WebM or MOV</span>
              </>
            )}
          </button>
          <input ref={videoRef} type="file" accept="video/*" onChange={handleVideo} className="hidden" />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Thumbnail *</label>
          <button
            type="button"
            onClick={() => thumbRef.current?.click()}
            className="relative w-full aspect-video max-w-xs border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl overflow-hidden transition-colors bg-gray-50 flex items-center justify-center"
          >
            {thumbPreview ? (
              <img src={thumbPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">Click to select thumbnail</span>
              </div>
            )}
          </button>
          <input ref={thumbRef} type="file" accept="image/*" onChange={handleThumb} className="hidden" />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Add a title that describes your video"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={5}
            placeholder="Tell viewers about your video"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-sm font-medium rounded-full hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Uploading...' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  )
}
