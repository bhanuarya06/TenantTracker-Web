import { apiClient } from './apiClient'
import { API_ENDPOINTS } from '../config/api'

export const paymentService = {
  async getPayments(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.PAYMENTS, { params })
    return response.data
  },

  async getPaymentById(id) {
    const response = await apiClient.get(`${API_ENDPOINTS.PAYMENTS}/${id}`)
    return response.data
  },

  async createPayment(paymentData) {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_PAYMENT, paymentData)
    return response.data
  },

  async updatePayment(id, paymentData) {
    const response = await apiClient.put(`${API_ENDPOINTS.PAYMENTS}/${id}`, paymentData)
    return response.data
  },

  async deletePayment(id) {
    const response = await apiClient.delete(`${API_ENDPOINTS.PAYMENTS}/${id}`)
    return response.data
  },

  async processRefund(id, refundData) {
    const response = await apiClient.post(`${API_ENDPOINTS.PAYMENTS}/${id}/refund`, refundData)
    return response.data
  },

  async getPaymentStats() {
    const response = await apiClient.get(API_ENDPOINTS.PAYMENT_STATS)
    return response.data
  },

  // For tenant users
  async getTenantPayments(params = {}) {
    const response = await apiClient.get(`${API_ENDPOINTS.PAYMENTS}/tenant`, { params })
    return response.data
  }
}