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
      <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-2xl border-b border-blue-500/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <Link
              to={ROUTES.HOME}
              className="flex items-center space-x-3 text-3xl font-black text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text hover:from-blue-300 hover:to-cyan-200 transition-all duration-300 transform hover:scale-110"
            >
              <span className="text-4xl">🏠</span>
              <span>TenantTracker</span>
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-24">
              {isAuthenticated && (
                <>
                  <Link
                    to={ROUTES.DASHBOARD}
                    className="relative text-white font-semibold text-lg group hover:text-cyan-300 transition-all duration-300 flex flex-col items-center"
                  >
                    <span>📊 Dashboard</span>
                    <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-300 group-hover:w-full transition-all duration-300 rounded-full"></span>
                  </Link>
                  {userType === USER_TYPES.OWNER && (
                    <Link
                      to={ROUTES.PROPERTIES}
                      className="relative text-white font-semibold text-lg group hover:text-cyan-300 transition-all duration-300 flex flex-col items-center"
                    >
                      <span>🏢 Properties</span>
                      <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-300 group-hover:w-full transition-all duration-300 rounded-full"></span>
                    </Link>
                  )}
                </>
              )}
              <Link
                to={ROUTES.CONTACT}
                className="relative text-white font-semibold text-lg group hover:text-cyan-300 transition-all duration-300 flex flex-col items-center"
              >
                <span>📞 Contact</span>
                <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-300 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </Link>
            </nav>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-6">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-semibold text-transparent bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text">
                    Welcome, {user?.firstName} 👋
                  </span>
                  <div className="w-px h-8 bg-gradient-to-b from-blue-400 to-cyan-300"></div>
                  <UserDropdown user={user} onLogout={handleLogout} />
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  {/* User Type Selector */}
                  <select
                    value={userType}
                    onChange={(e) => handleUserTypeChange(e.target.value)}
                    className="text-sm font-semibold border border-blue-400/50 bg-slate-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300 hover:border-cyan-400"
                  >
                    <option value={USER_TYPES.OWNER}>👨 Owner</option>
                    <option value={USER_TYPES.TENANT}>👤 Tenant</option>
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