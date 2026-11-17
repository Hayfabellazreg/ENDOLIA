import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_DEFAULTS = {
  admin: '/admin/dashboard',
  doctor: '/doctor/dashboard',
  secretaire: '/secretaire/dashboard',
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={ROLE_DEFAULTS[currentUser.role] || '/login'} replace />
  }

  return children
}
