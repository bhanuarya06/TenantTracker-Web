import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Header } from './Header'
import { Footer } from './Footer'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { selectAuthLoading } from '../../store/slices/authSlice'
import { useAuth } from '../../hooks/useAuth'

export const AppLayout = () => {
  const isLoading = useSelector(selectAuthLoading)
  const { initializeAuth } = useAuth()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

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