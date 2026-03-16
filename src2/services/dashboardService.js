import { apiClient } from './apiClient'
import { API_ENDPOINTS } from '../config/api'

export const dashboardService = {
  async getDashboard() {
    const response = await apiClient.get(API_ENDPOINTS.DASHBOARD)
    return response.data
  }
}
