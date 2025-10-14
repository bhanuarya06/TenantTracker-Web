import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { authService } from '../services/authService'
import {
  setLoading,
  setUser,
  clearUser,
  setError,
  selectUser,
  selectUserType,
  selectIsAuthenticated,
  selectAuthLoading,
} from '../store/slices/authSlice'
import { clearUserData } from '../store/slices/userSlice'
import toast from 'react-hot-toast'

export const useAuth = () => {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const userType = useSelector(selectUserType)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isLoading = useSelector(selectAuthLoading)

  const initializeAuth = useCallback(async () => {
    try {
      dispatch(setLoading(true))
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      )
      
      const userData = await Promise.race([
        authService.getCurrentUser(userType),
        timeoutPromise
      ])
      dispatch(setUser(userData.OwnerInfo || userData.TenantInfo || userData))
    } catch (error) {
      // User not authenticated or error occurred
      console.log('Auth initialization failed:', error.message)
      dispatch(clearUser())
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch, userType])

  const login = useCallback(async (credentials) => {
    try {
      dispatch(setLoading(true))
      const response = await authService.login(credentials, userType)
      const userData = response.OwnerInfo || response.TenantInfo || response
      dispatch(setUser(userData))
      toast.success('Login successful!')
      return { success: true, data: userData }
    } catch (error) {
      dispatch(setError(error.message))
      toast.error(error.message)
      return { success: false, error: error.message }
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch, userType])

  const register = useCallback(async (userData) => {
    try {
      dispatch(setLoading(true))
      const response = await authService.register(userData, userType)
      const user = response.OwnerInfo || response.TenantInfo || response
      dispatch(setUser(user))
      toast.success('Registration successful!')
      return { success: true, data: user }
    } catch (error) {
      dispatch(setError(error.message))
      toast.error(error.message)
      return { success: false, error: error.message }
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch, userType])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
      dispatch(clearUser())
      dispatch(clearUserData())
      toast.success('Logged out successfully')
    } catch (error) {
      // Still clear local state even if API call fails
      dispatch(clearUser())
      dispatch(clearUserData())
      toast.error('Logout failed, but you have been logged out locally')
    }
  }, [dispatch])

  const updateProfile = useCallback(async (profileData) => {
    try {
      dispatch(setLoading(true))
      const response = await authService.updateProfile(profileData, userType)
      const updatedUser = response.owner || response.tenant || response
      dispatch(setUser(updatedUser))
      toast.success('Profile updated successfully!')
      return { success: true, data: updatedUser }
    } catch (error) {
      dispatch(setError(error.message))
      toast.error(error.message)
      return { success: false, error: error.message }
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch, userType])

  return {
    user,
    userType,
    isAuthenticated,
    isLoading,
    initializeAuth,
    login,
    register,
    logout,
    updateProfile,
  }
}