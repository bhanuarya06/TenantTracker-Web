// In development, point to backend server. In production, use relative URL
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/api'  // Backend server port  
  : '/api';

export const API_ENDPOINTS = {
  // Auth endpoints (unified for all roles)
  LOGIN: '/auth/login',
  REGISTER: '/auth/register', 
  LOGOUT: '/auth/logout',
  
  // User endpoints (unified)
  PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/profile',
  
  // Property management endpoints (Owner-only)
  PROPERTIES: '/properties',
  ADD_PROPERTY: '/properties',
  UPDATE_PROPERTY: (id) => `/properties/${id}`,
  DELETE_PROPERTY: (id) => `/properties/${id}`,
  
  // Tenant management endpoints (Owner-only)
  TENANTS: '/tenants',
  ADD_TENANT: '/tenants',
  UPDATE_TENANT: (id) => `/tenants/${id}`,
  DELETE_TENANT: (id) => `/tenants/${id}`,
  
  // Bill management endpoints
  BILLS: '/bills',
  CREATE_BILL: '/bills',
  UPDATE_BILL: (id) => `/bills/${id}`,
  DELETE_BILL: (id) => `/bills/${id}`,
  GENERATE_RECURRING_BILLS: '/bills/generate-recurring', // Owner-only
  
  // Payment management endpoints  
  PAYMENTS: '/payments',
  CREATE_PAYMENT: '/payments',
  PAYMENT_STATS: '/payments/stats', // Owner-only
  
  // Dashboard endpoints (role-filtered)
  DASHBOARD: '/dashboard',
  TENANT_DASHBOARD: '/tenants/dashboard', // Tenant-only
}

export { API_BASE_URL }