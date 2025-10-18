export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  TENANTS: '/tenants',
  ADDTENANT: '/addtenant',
  EDITTENANT: (id) => `/edittenant/${id}`,
  RENT_HISTORY: '/rent-history',
  ADD_BILL: (id) => `/add-bill/${id}`,
  CONTACT: '/contact',
}

export const USER_TYPES = {
  OWNER: 'owner',
  TENANT: 'tenant',
}

export const FORM_VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  PHONE_REGEX: /^\+?[\d\s-()]+$/,
}

export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: 256,
  HEADER_HEIGHT: 64,
  MOBILE_BREAKPOINT: 768,
}

export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
}