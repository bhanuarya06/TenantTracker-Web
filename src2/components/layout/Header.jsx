import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { 
  selectIsAuthenticated, 
  selectUser, 
  selectUserType,
  setUserType 
} from '../../store/slices/authSlice'
import { toggleMobileMenu, selectMobileMenuOpen } from '../../store/slices/uiSlice'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { UserDropdown } from './UserDropdown'
import { MobileMenu } from './MobileMenu'
import { USER_TYPES, ROUTES } from '../../config/constants'

export const Header = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const userType = useSelector(selectUserType)
  const mobileMenuOpen = useSelector(selectMobileMenuOpen)
  const { logout } = useAuth()

  const handleUserTypeChange = (newUserType) => {
    dispatch(setUserType(newUserType))
  }

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.HOME)
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to={ROUTES.HOME}
              className="flex items-center space-x-2 text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <span>🏠</span>
              <span>TenantTracker</span>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to={ROUTES.HOME}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Home
              </Link>
              {isAuthenticated && (
                <Link
                  to={ROUTES.DASHBOARD}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
              )}
              <Link
                to={ROUTES.CONTACT}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Contact
              </Link>
            </nav>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Welcome, {user?.firstName}
                  </span>
                  <UserDropdown user={user} onLogout={handleLogout} />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {/* User Type Selector */}
                  <select
                    value={userType}
                    onChange={(e) => handleUserTypeChange(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={USER_TYPES.OWNER}>Owner</option>
                    <option value={USER_TYPES.TENANT}>Tenant</option>
                  </select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(ROUTES.LOGIN)}
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate(ROUTES.REGISTER)}
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => dispatch(toggleMobileMenu())}
        isAuthenticated={isAuthenticated}
        user={user}
        userType={userType}
        onUserTypeChange={handleUserTypeChange}
        onLogout={handleLogout}
      />
    </>
  )
}