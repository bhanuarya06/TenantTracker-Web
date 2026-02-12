import { apiClient } from './apiClient'
import { API_ENDPOINTS } from '../config/api'

export const propertyService = {
  async getProperties(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.PROPERTIES, { params })
    return response.data
  },

  async getPropertyById(id) {
    const response = await apiClient.get(`${API_ENDPOINTS.PROPERTIES}/${id}`)
    return response.data
  },

  async createProperty(propertyData) {
    const response = await apiClient.post(API_ENDPOINTS.ADD_PROPERTY, propertyData)
    return response.data
  },

  async updateProperty(id, propertyData) {
    const response = await apiClient.put(API_ENDPOINTS.UPDATE_PROPERTY(id), propertyData)
    return response.data
  },

  async deleteProperty(id) {
    const response = await apiClient.delete(API_ENDPOINTS.DELETE_PROPERTY(id))
    return response.data
  },

  async getPropertyStats(id) {
    const response = await apiClient.get(`${API_ENDPOINTS.PROPERTIES}/${id}/stats`)
    return response.data
  },

  async getAvailableUnits(id) {
    const response = await apiClient.get(`${API_ENDPOINTS.PROPERTIES}/${id}/available-units`)
    return response.data
  }
}