import { createSlice } from '@reduxjs/toolkit'

// Helper functions for localStorage
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error)
  }
}

const loadFromStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error)
    return defaultValue
  }
}

const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Failed to remove ${key} from localStorage:`, error)
  }
}

const initialState = {
  user: loadFromStorage('auth_user', null),
  userType: loadFromStorage('auth_userType', 'owner'),
  isAuthenticated: loadFromStorage('auth_isAuthenticated', false),
  isLoading: false,
  error: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    
    setUser: (state, action) => {
      console.log('authSlice setUser called with:', action.payload)
      state.user = action.payload
      state.isAuthenticated = !!action.payload
      state.error = null
      
      console.log('Auth state updated - isAuthenticated:', !!action.payload)
      
      // Save to localStorage
      if (action.payload) {
        saveToStorage('auth_user', action.payload)
        saveToStorage('auth_isAuthenticated', true)
        console.log('Saved user data to localStorage')
      }
    },
    
    setUserType: (state, action) => {
      state.userType = action.payload
      saveToStorage('auth_userType', action.payload)
    },
    
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
      
      // Clear from localStorage
      removeFromStorage('auth_user')
      removeFromStorage('auth_isAuthenticated') 
      removeFromStorage('auth_userType')
    },
    
    setError: (state, action) => {
      state.error = action.payload
      state.isLoading = false
    },
    
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setLoading,
  setUser,
  setUserType,
  clearUser,
  setError,
  clearError,
} = authSlice.actions

// Selectors
export const selectAuth = (state) => state.auth
export const selectUser = (state) => state.auth.user
export const selectUserType = (state) => state.auth.userType
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading = (state) => state.auth.isLoading
export const selectAuthError = (state) => state.auth.error