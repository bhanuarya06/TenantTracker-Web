/**
 * Auth Slice — Redux state for authentication
 *
 * Storage strategy (production-grade):
 * - ACCESS TOKEN: stored in-memory only (tokenManager.js) — NOT in Redux or localStorage
 * - REFRESH TOKEN: httpOnly Secure cookie (set by backend) — inaccessible to JS
 * - USER DATA: localStorage for persistence across page refreshes (non-sensitive)
 * - USER TYPE: localStorage for persistence (non-sensitive preference)
 * - isAuthenticated: localStorage as a hint, verified on init via /auth/me
 *
 * Why localStorage for user data but not tokens:
 * - User data (name, email, role) is non-sensitive display data
 * - Persisting it avoids a flash of unauthenticated content on refresh
 * - The actual auth check happens via the httpOnly cookie + /auth/me
 * - Even if localStorage is tampered with, protected routes still verify server-side
 *
 * OAuth fields:
 * - authProvider: which OAuth provider was used (null for email/password)
 * - linkedProviders: array of linked OAuth providers for the account
 */

import { createSlice } from "@reduxjs/toolkit";

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage might be full or disabled
  }
};

const loadFromStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore
  }
};

const initialState = {
  user: loadFromStorage("auth_user", null),
  userType: loadFromStorage("auth_userType", "owner"),
  isAuthenticated: loadFromStorage("auth_isAuthenticated", false),
  isLoading: false,
  error: null,
  // OAuth-specific state
  authProvider: loadFromStorage("auth_provider", null), // 'google' | 'github' | null
  linkedProviders: loadFromStorage("auth_linked_providers", []), // ['google', 'github']
  oauthLoading: false, // Separate loading state for OAuth flows
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setOAuthLoading: (state, action) => {
      state.oauthLoading = action.payload;
    },

    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;

      if (action.payload) {
        saveToStorage("auth_user", action.payload);
        saveToStorage("auth_isAuthenticated", true);
      }
    },

    setUserType: (state, action) => {
      state.userType = action.payload;
      saveToStorage("auth_userType", action.payload);
    },

    setAuthProvider: (state, action) => {
      state.authProvider = action.payload;
      saveToStorage("auth_provider", action.payload);
    },

    setLinkedProviders: (state, action) => {
      state.linkedProviders = action.payload;
      saveToStorage("auth_linked_providers", action.payload);
    },

    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.authProvider = null;
      state.linkedProviders = [];

      removeFromStorage("auth_user");
      removeFromStorage("auth_isAuthenticated");
      removeFromStorage("auth_userType");
      removeFromStorage("auth_provider");
      removeFromStorage("auth_linked_providers");
      // NOTE: We do NOT remove auth_token from localStorage here
      // because tokens are now managed in-memory by tokenManager.js
      // This line cleans up the legacy token if it exists:
      removeFromStorage("auth_token");
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
      state.oauthLoading = false;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setOAuthLoading,
  setUser,
  setUserType,
  setAuthProvider,
  setLinkedProviders,
  clearUser,
  setError,
  clearError,
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectUserType = (state) => state.auth.userType;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthProvider = (state) => state.auth.authProvider;
export const selectLinkedProviders = (state) => state.auth.linkedProviders;
export const selectOAuthLoading = (state) => state.auth.oauthLoading;
