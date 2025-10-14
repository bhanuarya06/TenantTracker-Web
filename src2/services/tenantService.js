import { apiClient } from './apiClient'
import { API_ENDPOINTS } from '../config/api'

export const tenantService = {
  async getTenants() {
    const response = await apiClient.get(API_ENDPOINTS.TENANTS)
    return response.data
  },

  async addTenant(tenantData) {
    const response = await apiClient.post(API_ENDPOINTS.ADD_TENANT, tenantData)
    return response.data
  },

  async updateTenant(tenantId, tenantData) {
    // Add the tenant ID to the request body as your backend expects it
    const updateData = { ...tenantData, _id: tenantId }
    const response = await apiClient.put(API_ENDPOINTS.UPDATE_TENANT, updateData)
    return response.data
  },

  async getRentHistory(tenantId) {
    const response = await apiClient.get(API_ENDPOINTS.RENT_HISTORY, {
      data: { tenantId }
    })
    return response.data
  },

  async createBill(billData) {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_BILL, billData)
    return response.data
  },

  async updateBill(billData) {
    const response = await apiClient.put(API_ENDPOINTS.UPDATE_BILL, billData)
    return response.data
  },
}