import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useRef, useEffect } from 'react'
import { authService } from '../services/authService'
import {
  setLoading,
  setUser,
  clearUser,
  setError,
  setUserType,
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

    // Don't initialize on login/register pages - exit without any Redux dispatches
    const currentPath = window.location.pathname;
    if (currentPath.includes('/login') || currentPath.includes('/register')) {
      console.log('Auth: Skipping initialization on auth pages to prevent remounting')
      return;
    }

    try {
      initializationRef.current = true;
      dispatch(setLoading(true))
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      )
      
      const userData = await Promise.race([
        authService.getCurrentUser(),
        timeoutPromise
      ])
      
      // Handle new unified User model response structure
      const user = userData.data?.user || userData.user || userData.data || userData
      
      // Validate user data matches new User model structure
      if (user && user.email && user.role && (user.id || user._id)) {
        dispatch(setUser(user))
        
        // Set user type from the response role (owner/tenant/admin)
        dispatch(setUserType(user.role))
        
        console.log('Auth initialization successful for user:', user.email, 'role:', user.role)
      } else {
        console.log('No valid user data found or invalid format, clearing auth state')
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

  const login = useCallback(async (loginData) => {
    try {
      dispatch(setLoading(true))
      
      // Add role to login data for unified API
      const requestData = {
        ...loginData,
        role: userType
      }
      
      console.log('useAuth: Attempting login with:', requestData)
      
      const response = await authService.login(requestData)
      
      console.log('Login response:', response)
      
      // Handle backend controller response: { success: true, data: { user: {...}, token: "..." }, message: "..." }
      if (response.success && response.data) {
        const userData = response.data.user
        const token = response.data.token
        
        console.log('Extracted user data:', userData)
        console.log('Token received:', !!token)
        
        // Validate user data has required fields from User model
        if (userData && userData.email && userData.role) {
          dispatch(setUser(userData))
          console.log('Dispatched setUser with:', userData)
          
          // Set user type from the response role (owner/tenant/admin)
          dispatch(setUserType(userData.role))
          console.log('Set user type to:', userData.role)
          
          // Store token if needed (for future API calls)
          if (token) {
            localStorage.setItem('auth_token', token)
          }
          
          toast.success('Login successful!')
          return { success: true, data: userData }
        } else {
          console.error('Invalid user data received:', userData)
          throw new Error('Invalid user data received from server')
        }
      } else {
        console.error('Login failed - invalid response structure:', response)
        throw new Error(response.message || 'Login failed')
      }
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
      
      // Add role to userData for unified API
      const registerData = {
        ...userData,
        role: userType
      }
      
      const response = await authService.register(registerData)
      
      console.log('Registration response:', response)
      
      // Handle backend controller response: { success: true, data: { user: {...}, token: "..." }, message: "..." }
      if (response.success && response.data) {
        const user = response.data.user
        const token = response.data.token
        
        console.log('Extracted user data:', user)
        
        // Validate user data has required fields from User model
        if (user && user.email && user.role) {
          dispatch(setUser(user))
          dispatch(setUserType(user.role))
          
          // Store token if needed
          if (token) {
            localStorage.setItem('auth_token', token)
          }
        } else {
          console.error('Invalid user data in registration response:', user)
          throw new Error('Invalid user data received from server')
        }
      } else {
        console.error('Registration failed - invalid response structure:', response)
        throw new Error(response.message || 'Registration failed')
      }
      
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
      const response = await authService.updateProfile(profileData)
      
      console.log('Profile update response:', response)
      
      // Handle backend controller response: { success: true, data: { user: {...} }, message: "..." }
      if (response.success && response.data) {
        const updatedUser = response.data.user
        
        console.log('Extracted updated user data:', updatedUser)
        
        // Validate updated user data
        if (updatedUser && updatedUser.email && updatedUser.role) {
          dispatch(setUser(updatedUser))
          dispatch(setUserType(updatedUser.role))
          
          toast.success('Profile updated successfully!')
          return { success: true, data: updatedUser }
        } else {
          console.error('Invalid updated user data in response:', updatedUser)
          throw new Error('Invalid user data received from server')
        }
      } else {
        console.error('Profile update failed - invalid response structure:', response)
        throw new Error(response.message || 'Profile update failed')
      }
    } catch (error) {
      dispatch(setError(error.message))
      toast.error(error.message)
      return { success: false, error: error.message }
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch])

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