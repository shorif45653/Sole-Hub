import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="empty-state">
        <div className="loading-spinner-container" style={{ justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <svg className="loading-spinner loading-spinner--lg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute