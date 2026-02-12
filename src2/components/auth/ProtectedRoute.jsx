import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectAuthLoading } from '../../store/slices/authSlice'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ROUTES } from '../../config/constants'

export const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading = useSelector(selectAuthLoading)
  const location = useLocation()

  console.log('ProtectedRoute check:', { 
    isAuthenticated, 
    isLoading, 
    path: location.pathname 
  })

  if (isLoading) {
    console.log('ProtectedRoute: Showing loading spinner')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login')
    // Redirect to login page with return URL
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  console.log('ProtectedRoute: User authenticated, allowing access')
  return <Outlet />
}