import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  userType: 'owner', // 'owner' or 'tenant'
  isAuthenticated: false,
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
      state.user = action.payload
      state.isAuthenticated = !!action.payload
      state.error = null
    },
    
    setUserType: (state, action) => {
      state.userType = action.payload
    },
    
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.error = null
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