import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './slices/authSlice'
import { userSlice } from './slices/userSlice'
import { uiSlice } from './slices/uiSlice'
import { tenantSlice } from './slices/tenantSlice'
import propertyReducer from './slices/propertySlice'
import billReducer from './slices/billSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    user: userSlice.reducer,
    ui: uiSlice.reducer,
    tenant: tenantSlice.reducer,
    property: propertyReducer,
    bill: billReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

// Export store for usage in components