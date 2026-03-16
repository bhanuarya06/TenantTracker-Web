import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "../config/api";

export const tenantService = {
  async getTenants() {
    const response = await apiClient.get(API_ENDPOINTS.TENANTS);
    return response.data;
  },

  async getTenantById(tenantId) {
    const response = await apiClient.get(API_ENDPOINTS.GET_TENANT(tenantId));
    return response.data;
  },

  async addTenant(tenantData) {
    const response = await apiClient.post(API_ENDPOINTS.ADD_TENANT, tenantData);
    return response.data;
  },

  async updateTenant(tenantId, tenantData) {
    const response = await apiClient.put(
      API_ENDPOINTS.UPDATE_TENANT(tenantId),
      tenantData,
    );
    return response.data;
  },

  async deleteTenant(tenantId) {
    const response = await apiClient.delete(API_ENDPOINTS.DELETE_TENANT(tenantId));
    return response.data;
  },

  async getRentHistory(tenantId) {
    const response = await apiClient.get(API_ENDPOINTS.RENT_HISTORY(tenantId));
    return response.data;
  },
};
