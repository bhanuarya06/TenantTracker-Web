import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useRef, useEffect } from 'react'
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
  const initializationRef = useRef(false)
  const userTypeRef = useRef(userType)

  // Update the ref when userType changes
  useEffect(() => {
    userTypeRef.current = userType
  }, [userType])

  const initializeAuth = useCallback(async () => {
    // Prevent multiple simultaneous initialization attempts
    if (initializationRef.current || isAuthenticated || isLoading) {
      return;
    }

    // Don't initialize on login/register pages
    const currentPath = window.location.pathname;
    if (currentPath.includes('/login') || currentPath.includes('/register')) {
      return;
    }

    try {
      initializationRef.current = true;
      dispatch(setLoading(true))
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
      
      // Use ref to avoid dependency issues
      const currentUserType = userTypeRef.current || 'owner';
      
      const userData = await Promise.race([
        authService.getCurrentUser(currentUserType),
        timeoutPromise
      ])
      
      if (userData && (userData.OwnerInfo || userData.TenantInfo || userData.firstName)) {
        dispatch(setUser(userData.OwnerInfo || userData.TenantInfo || userData))
      } else {
        dispatch(clearUser())
      }
    } catch (authError) {
      // User not authenticated or error occurred
      console.log('Auth initialization failed:', authError.message)
      dispatch(clearUser())
    } finally {
      dispatch(setLoading(false))
      // Reset the ref after a delay to allow for future attempts if needed
      setTimeout(() => {
        initializationRef.current = false;
      }, 1000);
    }
  }, [dispatch, isAuthenticated, isLoading])

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