import { apiClient } from './apiClient'
import { API_ENDPOINTS } from '../config/api'

export const authService = {
  async login(credentials) {
    // Include role in the request body for unified login endpoint
    const loginData = {
      ...credentials,
      role: credentials.role || 'owner' // Default to owner if not specified
    }
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, loginData)
    return response.data
  },

  async register(userData) {
    // Include role in the request body for unified register endpoint  
    const registerData = {
      ...userData,
      role: userData.role || 'owner' // Default to owner if not specified
    }
    const response = await apiClient.post(API_ENDPOINTS.REGISTER, registerData)
    return response.data
  },

  async logout() {
    const response = await apiClient.post(API_ENDPOINTS.LOGOUT)
    return response.data
  },

  async getCurrentUser() {
    const response = await apiClient.get(API_ENDPOINTS.PROFILE)
    return response.data
  },

  async updateProfile(userData) {
    const response = await apiClient.put(API_ENDPOINTS.UPDATE_PROFILE, userData)
    return response.data
  },
}