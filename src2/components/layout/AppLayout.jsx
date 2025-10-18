import { Outlet } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Header } from './Header'
import { Footer } from './Footer'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { selectAuthLoading, setLoading, setUser, clearUser } from '../../store/slices/authSlice'
import { authService } from '../../services/authService'

export const AppLayout = () => {
  const isLoading = useSelector(selectAuthLoading)
  const dispatch = useDispatch()
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Only initialize auth once when the app starts
    if (hasInitialized.current) return
    
    hasInitialized.current = true
    
    const initAuth = async () => {
      // Skip auth check on public pages
      const publicPaths = ['/login', '/register', '/']
      if (publicPaths.includes(window.location.pathname)) {
        return
      }

      try {
        dispatch(setLoading(true))
        const userData = await authService.getCurrentUser('owner')
        if (userData) {
          dispatch(setUser(userData.OwnerInfo || userData.TenantInfo || userData))
        }
      } catch {
        dispatch(clearUser())
      } finally {
        dispatch(setLoading(false))
      }
    }

    initAuth()
  }, [dispatch])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}