import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VideoPlayer from './pages/VideoPlayer'
import Channel from './pages/Channel'
import Dashboard from './pages/Dashboard'
import WatchHistory from './pages/WatchHistory'
import UploadVideo from './pages/UploadVideo'
import Settings from './pages/Settings'

const AUTH_PATHS = ['/login', '/register']

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()
  const isAuthPage = AUTH_PATHS.includes(location.pathname)

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar onMenuClick={() => setSidebarOpen((v) => !v)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main
        className={`pt-14 transition-all duration-200 ${sidebarOpen ? 'md:ml-60' : 'ml-0'}`}
        onClick={() => sidebarOpen && setSidebarOpen(false)}
      >
        <div className="p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/video/:videoId" element={<VideoPlayer />} />
            <Route path="/channel/:username" element={<Channel />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <WatchHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadVideo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  )
}
