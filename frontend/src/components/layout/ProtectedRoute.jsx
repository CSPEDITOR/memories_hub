import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext.jsx'

export function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()
  const loc = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  }
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <motion.div
          className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      </div>
    )
  }
  return children
}
