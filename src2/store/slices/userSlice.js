import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  profile: null,
  preferences: {
    theme: 'light',
    notifications: true,
  },
  isLoading: false,
  error: null,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      state.profile = action.payload
      state.error = null
    },
    
    updateUserProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload }
    },
    
    setUserPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload }
    },
    
    setUserLoading: (state, action) => {
      state.isLoading = action.payload
    },
    
    setUserError: (state, action) => {
      state.error = action.payload
      state.isLoading = false
    },
    
    clearUserData: (state) => {
      state.profile = null
      state.error = null
      state.isLoading = false
    },
  },
})

export const {
  setUserProfile,
  updateUserProfile,
  setUserPreferences,
  setUserLoading,
  setUserError,
  clearUserData,
} = userSlice.actions

// Selectors
export const selectUserProfile = (state) => state.user.profile
export const selectUserPreferences = (state) => state.user.preferences
export const selectUserLoading = (state) => state.user.isLoading
export const selectUserError = (state) => state.user.error