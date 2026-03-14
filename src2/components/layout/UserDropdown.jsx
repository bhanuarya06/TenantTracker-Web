import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../config/constants'

export const UserDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/50 hover:border-cyan-400 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300 group"
      >
        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-cyan-500/50 transition-shadow">
          {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <svg
          className={`w-5 h-5 text-cyan-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-blue-400/30 py-2 z-50 backdrop-blur-xl">
          <div className="px-5 py-4 border-b border-blue-400/20 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
            <p className="font-bold text-white text-lg">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-cyan-300 font-medium">{user?.email}</p>
          </div>
          
          <Link
            to={ROUTES.PROFILE}
            onClick={() => setIsOpen(false)}
            className="block px-5 py-3 text-white hover:bg-blue-500/20 transition-all duration-200 font-semibold flex items-center space-x-2 group"
          >
            <span>⚙️</span>
            <span>Profile Settings</span>
            <span className="ml-auto text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </Link>
          
          <Link
            to={ROUTES.DASHBOARD}
            onClick={() => setIsOpen(false)}
            className="block px-5 py-3 text-white hover:bg-blue-500/20 transition-all duration-200 font-semibold flex items-center space-x-2 group"
          >
            <span>📊</span>
            <span>Dashboard</span>
            <span className="ml-auto text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </Link>
          
          <hr className="my-2 border-blue-400/20" />
          
          <button
            onClick={() => {
              setIsOpen(false)
              onLogout()
            }}
            className="block w-full text-left px-5 py-3 text-red-400 hover:bg-red-500/20 transition-all duration-200 font-semibold flex items-center space-x-2 group"
          >
            <span>🚪</span>
            <span>Sign Out</span>
            <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>
        </div>
      )}
    </div>
  )
}