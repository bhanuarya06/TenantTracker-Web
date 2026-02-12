import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  properties: [],
  selectedProperty: null,
  availableUnits: [],
  propertyStats: null,
  isLoading: false,
  error: null,
  pagination: null,
}

export const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    
    setProperties: (state, action) => {
      state.properties = action.payload.properties || []
      state.pagination = action.payload.pagination || null
      state.error = null
    },
    
    setSelectedProperty: (state, action) => {
      state.selectedProperty = action.payload
      state.error = null
    },
    
    setAvailableUnits: (state, action) => {
      state.availableUnits = action.payload.units || []
      state.error = null
    },
    
    setPropertyStats: (state, action) => {
      state.propertyStats = action.payload.stats || null
      state.error = null
    },
    
    addProperty: (state, action) => {
      state.properties.unshift(action.payload)
      state.error = null
    },
    
    updateProperty: (state, action) => {
      const index = state.properties.findIndex(p => p._id === action.payload._id)
      if (index !== -1) {
        state.properties[index] = action.payload
      }
      if (state.selectedProperty?._id === action.payload._id) {
        state.selectedProperty = action.payload
      }
      state.error = null
    },
    
    deleteProperty: (state, action) => {
      const propertyId = action.payload
      state.properties = state.properties.filter(p => p._id !== propertyId)
      if (state.selectedProperty?._id === propertyId) {
        state.selectedProperty = null
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
    
    clearProperties: (state) => {
      state.properties = []
      state.selectedProperty = null
      state.availableUnits = []
      state.propertyStats = null
      state.pagination = null
      state.error = null
    }
  },
})

export const {
  setLoading,
  setProperties,
  setSelectedProperty,
  setAvailableUnits,
  setPropertyStats,
  addProperty,
  updateProperty,
  deleteProperty,
  setError,
  clearError,
  clearProperties,
} = propertySlice.actions

// Selectors
export const selectProperties = (state) => state.property.properties
export const selectSelectedProperty = (state) => state.property.selectedProperty
export const selectAvailableUnits = (state) => state.property.availableUnits
export const selectPropertyStats = (state) => state.property.propertyStats
export const selectPropertyLoading = (state) => state.property.isLoading
export const selectPropertyError = (state) => state.property.error
export const selectPropertyPagination = (state) => state.property.pagination

export default propertySlice.reducer