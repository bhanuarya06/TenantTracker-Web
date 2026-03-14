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
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-72 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl slide-in-right border-l border-blue-500/30">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
            <h2 className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-300 hover:text-cyan-300 bg-blue-500/20 hover:bg-blue-500/30 transition-all"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          {isAuthenticated && user && (
            <div className="p-6 border-b border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-bold text-white">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-cyan-300 font-medium">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {isAuthenticated && (
              <>
                <Link
                  to={ROUTES.DASHBOARD}
                  onClick={onClose}
                  className="block px-4 py-3 rounded-lg text-white font-semibold hover:bg-blue-500/20 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>📊</span>
                  <span>Dashboard</span>
                </Link>
                <Link
                  to={ROUTES.PROFILE}
                  onClick={onClose}
                  className="block px-4 py-3 rounded-lg text-white font-semibold hover:bg-blue-500/20 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>⚙️</span>
                  <span>Profile</span>
                </Link>
                {userType === USER_TYPES.OWNER && (
                  <>
                    <Link
                      to={ROUTES.PROPERTIES}
                      onClick={onClose}
                      className="block px-4 py-3 rounded-lg text-white font-semibold hover:bg-blue-500/20 transition-all duration-200 flex items-center space-x-2"
                    >
                      <span>🏢</span>
                      <span>Properties</span>
                    </Link>
                    <Link
                      to={ROUTES.TENANTS}
                      onClick={onClose}
                      className="block px-4 py-3 rounded-lg text-white font-semibold hover:bg-blue-500/20 transition-all duration-200 flex items-center space-x-2"
                    >
                      <span>👥</span>
                      <span>Tenants</span>
                    </Link>
                  </>
                )}
              </>
            )}
            
            <Link
              to={ROUTES.CONTACT}
              onClick={onClose}
              className="block px-4 py-3 rounded-lg text-white font-semibold hover:bg-blue-500/20 transition-all duration-200 flex items-center space-x-2"
            >
              <span>📞</span>
              <span>Contact</span>
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="p-4 border-t border-blue-500/30 bg-gradient-to-t from-slate-900 to-transparent space-y-3">
            {isAuthenticated ? (
              <Button
                variant="danger"
                className="w-full"
                onClick={() => {
                  onClose()
                  onLogout()
                }}
              >
                🚪 Sign Out
              </Button>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text mb-2">
                    Login as:
                  </label>
                  <select
                    value={userType}
                    onChange={(e) => onUserTypeChange(e.target.value)}
                    className="w-full border border-blue-400/50 rounded-lg px-4 py-2 bg-slate-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                  >
                    <option value={USER_TYPES.OWNER}>👨 Owner</option>
                    <option value={USER_TYPES.TENANT}>👤 Tenant</option>
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
