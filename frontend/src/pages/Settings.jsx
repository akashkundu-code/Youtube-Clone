import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  changePassword,
} from '../api/user'

function Banner({ type, message }) {
  if (!message) return null
  const styles =
    type === 'error'
      ? 'bg-red-50 border-red-200 text-red-700'
      : 'bg-green-50 border-green-200 text-green-700'
  return <div className={`mb-4 p-3 border rounded-lg text-sm ${styles}`}>{message}</div>
}

export default function Settings() {
  const { user, setUser } = useAuth()

  // Account details
  const [details, setDetails] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  })
  const [detailsState, setDetailsState] = useState({ loading: false, msg: '', type: '' })

  // Password
  const [pw, setPw] = useState({ oldPassword: '', newPassword: '' })
  const [pwState, setPwState] = useState({ loading: false, msg: '', type: '' })

  // Images
  const [imgState, setImgState] = useState({ msg: '', type: '' })
  const avatarRef = useRef()
  const coverRef = useRef()

  const handleDetailsSubmit = async (e) => {
    e.preventDefault()
    setDetailsState({ loading: true, msg: '', type: '' })
    try {
      const res = await updateAccountDetails(details)
      setUser((u) => ({ ...u, ...res.data.data }))
      setDetailsState({ loading: false, msg: 'Profile updated successfully', type: 'success' })
    } catch (err) {
      setDetailsState({
        loading: false,
        msg: err.response?.data?.message || 'Update failed',
        type: 'error',
      })
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPwState({ loading: true, msg: '', type: '' })
    try {
      await changePassword(pw)
      setPw({ oldPassword: '', newPassword: '' })
      setPwState({ loading: false, msg: 'Password changed successfully', type: 'success' })
    } catch (err) {
      setPwState({
        loading: false,
        msg: err.response?.data?.message || 'Password change failed',
        type: 'error',
      })
    }
  }

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImgState({ msg: 'Uploading avatar...', type: 'success' })
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const res = await updateAvatar(fd)
      setUser((u) => ({ ...u, avatar: res.data.data.avatar }))
      setImgState({ msg: 'Avatar updated', type: 'success' })
    } catch (err) {
      setImgState({ msg: err.response?.data?.message || 'Avatar update failed', type: 'error' })
    }
  }

  const handleCover = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImgState({ msg: 'Uploading cover image...', type: 'success' })
    try {
      const fd = new FormData()
      fd.append('coverImage', file)
      const res = await updateCoverImage(fd)
      setUser((u) => ({ ...u, coverImage: res.data.data.coverImage }))
      setImgState({ msg: 'Cover image updated', type: 'success' })
    } catch (err) {
      setImgState({ msg: err.response?.data?.message || 'Cover update failed', type: 'error' })
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Images section */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-4">Profile images</h2>
        <Banner type={imgState.type} message={imgState.msg} />

        {/* Cover */}
        <div className="relative h-32 rounded-xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 mb-4 group">
          {user?.coverImage && (
            <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
          )}
          <button
            onClick={() => coverRef.current?.click()}
            className="absolute inset-0 bg-black/30 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center text-white text-sm font-medium transition-opacity"
          >
            <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Change cover
          </button>
          <input ref={coverRef} type="file" accept="image/*" onChange={handleCover} className="hidden" />
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <button
              onClick={() => avatarRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 rounded-full flex items-center justify-center text-white transition-opacity"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
          </div>
          <div>
            <p className="font-medium">{user?.fullName}</p>
            <p className="text-gray-500 text-sm">@{user?.username}</p>
            <p className="text-gray-400 text-xs mt-1">
              <span className="sm:hidden">Tap</span><span className="hidden sm:inline">Hover</span> an image to change it
            </p>
          </div>
        </div>
      </section>

      {/* Account details */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-4">Account details</h2>
        <Banner type={detailsState.type} message={detailsState.msg} />
        <form onSubmit={handleDetailsSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name</label>
            <input
              value={details.fullName}
              onChange={(e) => setDetails((d) => ({ ...d, fullName: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={details.email}
              onChange={(e) => setDetails((d) => ({ ...d, email: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={detailsState.loading}
              className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {detailsState.loading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>

      {/* Password */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Change password</h2>
        <Banner type={pwState.type} message={pwState.msg} />
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Current password</label>
            <input
              type="password"
              value={pw.oldPassword}
              onChange={(e) => setPw((p) => ({ ...p, oldPassword: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">New password</label>
            <input
              type="password"
              value={pw.newPassword}
              onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pwState.loading}
              className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {pwState.loading ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
