import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { ROUTES, USER_TYPES } from '../../config/constants'

export const MobileMenu = ({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  userType,
  onUserTypeChange,
  onLogout,
}) => {
  const navigate = useNavigate()

  if (!isOpen) return null

  return (
    <div className="md:hidden">
      <div className="fixed inset-0 z-40 bg-black bg-opacity-25" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-xl slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          {isAuthenticated && user && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Link
              to={ROUTES.HOME}
              onClick={onClose}
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Home
            </Link>
            
            {isAuthenticated && (
              <>
                <Link
                  to={ROUTES.DASHBOARD}
                  onClick={onClose}
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to={ROUTES.PROFILE}
                  onClick={onClose}
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Profile
                </Link>
                {userType === USER_TYPES.OWNER && (
                  <Link
                    to={ROUTES.TENANTS}
                    onClick={onClose}
                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Tenants
                  </Link>
                )}
              </>
            )}
            
            <Link
              to={ROUTES.CONTACT}
              onClick={onClose}
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onClose()
                  onLogout()
                }}
              >
                Sign Out
              </Button>
            ) : (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Login as:
                  </label>
                  <select
                    value={userType}
                    onChange={(e) => onUserTypeChange(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={USER_TYPES.OWNER}>Owner</option>
                    <option value={USER_TYPES.TENANT}>Tenant</option>
                  </select>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    onClose()
                    navigate(ROUTES.LOGIN)
                  }}
                >
                  Login
                </Button>
                
                <Button
                  className="w-full"
                  onClick={() => {
                    onClose()
                    navigate(ROUTES.REGISTER)
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}