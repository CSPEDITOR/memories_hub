import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout.jsx'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute.jsx'
import { DashboardPage } from '@/pages/DashboardPage.jsx'
import { LoginPage } from '@/pages/LoginPage.jsx'
import { RegisterPage } from '@/pages/RegisterPage.jsx'
import { EventsPage } from '@/pages/EventsPage.jsx'
import { StoryOfDayPage } from '@/pages/StoryOfDayPage.jsx'
import { MemoriesPage } from '@/pages/MemoriesPage.jsx'
import { UploadPage } from '@/pages/UploadPage.jsx'
import { ProfilePage } from '@/pages/ProfilePage.jsx'
import { SearchPage } from '@/pages/SearchPage.jsx'
import { NotificationsPage } from '@/pages/NotificationsPage.jsx'
import { useAuth } from '@/context/AuthContext.jsx'

function ProfileRedirect() {
  const { user } = useAuth()
  const id = user?._id || user?.id
  if (!id) return <Navigate to="/login" replace />
  return <Navigate to={`/profile/${id}`} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="story-of-the-day" element={<StoryOfDayPage />} />
        <Route path="memories" element={<MemoriesPage />} />
        <Route
          path="upload"
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route path="profile" element={<ProfileRedirect />} />
        <Route path="profile/:id" element={<ProfilePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
