import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tenants: [],
  selectedTenant: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  totalTenants: 0,
};

export const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    // Loading state management
    setLoading: (state, action) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    // Set tenants list after successful fetch
    setTenants: (state, action) => {
      // Handle both direct array and nested payload formats
      const tenantData = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.data?.tenants || action.payload?.tenants || [];
      state.tenants = tenantData;
      state.totalTenants = tenantData.length;
      state.lastFetched = new Date().toISOString();
      state.isLoading = false;
      state.error = null;
    },

    // Add a new tenant to the list
    addTenant: (state, action) => {
      state.tenants.push(action.payload);
      state.totalTenants = state.tenants.length;
    },

    // Update an existing tenant
    updateTenant: (state, action) => {
      const { id, data } = action.payload;
      const index = state.tenants.findIndex((tenant) => tenant._id === id);
      if (index !== -1) {
        state.tenants[index] = { ...state.tenants[index], ...data };
      }
    },

    // Remove a tenant from the list
    removeTenant: (state, action) => {
      const tenantId = action.payload;
      state.tenants = state.tenants.filter((tenant) => tenant._id !== tenantId);
      state.totalTenants = state.tenants.length;
      // Clear selected tenant if it was deleted
      if (state.selectedTenant?._id === tenantId) {
        state.selectedTenant = null;
      }
    },

    // Set selected tenant for detailed view
    setSelectedTenant: (state, action) => {
      state.selectedTenant = action.payload;
    },

    // Clear selected tenant
    clearSelectedTenant: (state) => {
      state.selectedTenant = null;
    },

    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Clear all tenant data (useful for logout)
    clearTenants: (state) => {
      state.tenants = [];
      state.selectedTenant = null;
      state.totalTenants = 0;
      state.lastFetched = null;
      state.error = null;
      state.isLoading = false;
    },

    // Update tenant balance (for billing operations)
    updateTenantBalance: (state, action) => {
      const { tenantId, balance } = action.payload;
      const index = state.tenants.findIndex(
        (tenant) => tenant._id === tenantId,
      );
      if (index !== -1) {
        state.tenants[index].balance = balance;
      }
      // Update selected tenant if it's the same one
      if (state.selectedTenant?._id === tenantId) {
        state.selectedTenant.balance = balance;
      }
    },
  },
});

export const {
  setLoading,
  setTenants,
  addTenant,
  updateTenant,
  removeTenant,
  setSelectedTenant,
  clearSelectedTenant,
  setError,
  clearError,
  clearTenants,
  updateTenantBalance,
} = tenantSlice.actions;

// Selectors
export const selectTenant = (state) => state.tenant;
export const selectTenants = (state) => state.tenant.tenants;
export const selectSelectedTenant = (state) => state.tenant.selectedTenant;
export const selectTenantLoading = (state) => state.tenant.isLoading;
export const selectTenantError = (state) => state.tenant.error;
export const selectTotalTenants = (state) => state.tenant.totalTenants;
export const selectLastFetched = (state) => state.tenant.lastFetched;

// Advanced selectors
export const selectTenantById = (state, tenantId) =>
  state.tenant.tenants.find((tenant) => tenant._id === tenantId);

export const selectTenantsByUnit = (state) =>
  state.tenant.tenants.sort((a, b) =>
    (a.unit || "").localeCompare(b.unit || ""),
  );

export const selectTenantsWithPendingBalance = (state) =>
  state.tenant.tenants.filter(
    (tenant) => tenant.balance && parseFloat(tenant.balance) < 0,
  );

export default tenantSlice.reducer;
