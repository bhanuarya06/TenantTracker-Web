const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: (userType) => `/${userType}/auth/login`,
  REGISTER: (userType) => `/${userType}/auth/signUp`,
  LOGOUT: '/logout',
  
  // User endpoints
  PROFILE: (userType) => `/${userType}/profile/view`,
  UPDATE_PROFILE: (userType) => `/${userType}/profile/edit`,
  
  // Tenant management endpoints
  TENANTS: '/owner/manageTenant/viewTenants',
  ADD_TENANT: '/owner/manageTenant/addTenant',
  UPDATE_TENANT: '/owner/manageTenant/updateTenant',
  DELETE_TENANT: '/owner/manageTenant/deleteTenant',
  
  // Bill management endpoints
  CREATE_BILL: '/owner/manageTenant/billTenant',
  UPDATE_BILL: '/owner/manageTenant/updateBill',
  RENT_HISTORY: '/owner/manageTenant/viewRentHistory',
}

export { API_BASE_URL }