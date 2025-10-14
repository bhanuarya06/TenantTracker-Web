import { apiClient } from './apiClient'
import { API_ENDPOINTS } from '../config/api'

export const authService = {
  async login(credentials, userType) {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN(userType), credentials)
    return response.data
  },

  async register(userData, userType) {
    const response = await apiClient.post(API_ENDPOINTS.REGISTER(userType), userData)
    return response.data
  },

  async logout() {
    const response = await apiClient.post(API_ENDPOINTS.LOGOUT)
    return response.data
  },

  async getCurrentUser(userType) {
    const response = await apiClient.get(API_ENDPOINTS.PROFILE(userType))
    return response.data
  },

  async updateProfile(userData, userType) {
    const response = await apiClient.put(API_ENDPOINTS.UPDATE_PROFILE(userType), userData)
    return response.data
  },
}