import { apiClient } from './apiClient'
import { API_ENDPOINTS } from '../config/api'

export const billService = {
  async getBills(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.BILLS, { params })
    return response.data
  },

  async getBillsByTenantId(tenantId) {
    const response = await apiClient.get(`${API_ENDPOINTS.BILLS}/tenant/${tenantId}`)
    return response.data
  },

  async getBillById(id) {
    const response = await apiClient.get(`${API_ENDPOINTS.BILLS}/${id}`)
    return response.data
  },

  async createBill(billData) {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_BILL, billData)
    return response.data
  },

  async updateBill(id, billData) {
    const response = await apiClient.put(API_ENDPOINTS.UPDATE_BILL(id), billData)
    return response.data
  },

  async deleteBill(id) {
    const response = await apiClient.delete(API_ENDPOINTS.DELETE_BILL(id))
    return response.data
  },

  async sendBill(id) {
    const response = await apiClient.post(API_ENDPOINTS.SEND_BILL(id))
    return response.data
  },

  async getBillsSummary() {
    const response = await apiClient.get(`${API_ENDPOINTS.BILLS}/summary`)
    return response.data
  },

  async generateRecurringBills(data) {
    const response = await apiClient.post(API_ENDPOINTS.GENERATE_RECURRING_BILLS, data)
    return response.data
  },

  // For tenant users
  async getTenantBills(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.TENANT_DASHBOARD, { params })
    return response.data
  }
}