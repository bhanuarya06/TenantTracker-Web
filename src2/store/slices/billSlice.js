import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  bills: [],
  selectedBill: null,
  billsSummary: null,
  tenantBills: [], // For tenant users
  isLoading: false,
  error: null,
  pagination: null,
}

export const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    
    setBills: (state, action) => {
      state.bills = action.payload.bills || []
      state.pagination = action.payload.pagination || null
      state.error = null
    },
    
    setSelectedBill: (state, action) => {
      state.selectedBill = action.payload
      state.error = null
    },
    
    setBillsSummary: (state, action) => {
      state.billsSummary = action.payload.summary || null
      state.error = null
    },
    
    setTenantBills: (state, action) => {
      state.tenantBills = action.payload.bills || []
      state.pagination = action.payload.pagination || null
      state.error = null
    },
    
    addBill: (state, action) => {
      state.bills.unshift(action.payload)
      state.error = null
    },
    
    updateBill: (state, action) => {
      const index = state.bills.findIndex(b => b._id === action.payload._id)
      if (index !== -1) {
        state.bills[index] = action.payload
      }
      if (state.selectedBill?._id === action.payload._id) {
        state.selectedBill = action.payload
      }
      // Update tenant bills if applicable
      const tenantIndex = state.tenantBills.findIndex(b => b._id === action.payload._id)
      if (tenantIndex !== -1) {
        state.tenantBills[tenantIndex] = action.payload
      }
      state.error = null
    },
    
    deleteBill: (state, action) => {
      const billId = action.payload
      state.bills = state.bills.filter(b => b._id !== billId)
      state.tenantBills = state.tenantBills.filter(b => b._id !== billId)
      if (state.selectedBill?._id === billId) {
        state.selectedBill = null
      }
      state.error = null
    },
    
    sendBill: (state, action) => {
      const updatedBill = action.payload
      const index = state.bills.findIndex(b => b._id === updatedBill._id)
      if (index !== -1) {
        state.bills[index] = updatedBill
      }
      if (state.selectedBill?._id === updatedBill._id) {
        state.selectedBill = updatedBill
      }
      state.error = null
    },
    
    setError: (state, action) => {
      state.error = action.payload
      state.isLoading = false
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    clearBills: (state) => {
      state.bills = []
      state.selectedBill = null
      state.billsSummary = null
      state.tenantBills = []
      state.pagination = null
      state.error = null
    }
  },
})

export const {
  setLoading,
  setBills,
  setSelectedBill,
  setBillsSummary,
  setTenantBills,
  addBill,
  updateBill,
  deleteBill,
  sendBill,
  setError,
  clearError,
  clearBills,
} = billSlice.actions

// Selectors
export const selectBills = (state) => state.bill.bills
export const selectSelectedBill = (state) => state.bill.selectedBill
export const selectBillsSummary = (state) => state.bill.billsSummary
export const selectTenantBills = (state) => state.bill.tenantBills
export const selectBillLoading = (state) => state.bill.isLoading
export const selectBillError = (state) => state.bill.error
export const selectBillPagination = (state) => state.bill.pagination

export default billSlice.reducer