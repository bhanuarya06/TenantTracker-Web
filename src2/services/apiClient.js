/**
 * API Client with OAuth 2.0 Token Management
 *
 * Production-grade Axios instance implementing:
 * 1. In-memory access token injection (not localStorage)
 * 2. Automatic silent token refresh on 401 responses
 * 3. Request queuing during refresh (prevents thundering herd)
 * 4. Proper error normalization
 *
 * Token lifecycle:
 * - Access token: stored in-memory via tokenManager (XSS-safe)
 * - Refresh token: httpOnly Secure cookie (managed by backend)
 * - On 401 → attempt silent refresh → retry original request
 * - On refresh failure → redirect to login
 */

import axios from "axios";
import { API_BASE_URL } from "../config/api";
import {
  getAccessToken,
  performSilentRefresh,
  onTokenEvents,
  clearTokens,
} from "./tokenManager.js";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send httpOnly cookies (refresh token) with every request
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request queue for pending requests during token refresh ---
let isRefreshing = false;
let failedRequestQueue = [];

function processQueue(error, token = null) {
  failedRequestQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedRequestQueue = [];
}

// --- Request Interceptor ---
// Attaches the in-memory access token to every outgoing request.
// No localStorage access — tokens live only in JS memory.
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- Response Interceptor ---
// Handles 401 responses by attempting silent token refresh.
// Implements the "refresh lock" pattern to prevent concurrent refresh calls.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry refresh requests themselves (prevents infinite loop)
    if (
      originalRequest._isRetry ||
      originalRequest.url?.includes("/token/refresh")
    ) {
      return Promise.reject(normalizeError(error));
    }

    // On 401, attempt to refresh the token
    if (error.response?.status === 401) {
      if (isRefreshing) {
        // Another request is already refreshing — queue this one
        return new Promise((resolve, reject) => {
          failedRequestQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          originalRequest._isRetry = true;
          return apiClient(originalRequest);
        });
      }

      isRefreshing = true;
      originalRequest._isRetry = true;

      try {
        const result = await performSilentRefresh();
        const newToken = result.token;

        // Retry all queued requests with the new token
        processQueue(null, newToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear everything and redirect to login
        processQueue(refreshError, null);
        clearTokens();

        // Clear persisted auth state to prevent redirect loop on reload
        try {
          localStorage.removeItem("auth_isAuthenticated");
          localStorage.removeItem("auth_user");
          localStorage.removeItem("auth_provider");
        } catch {
          // Ignore storage errors
        }

        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }

        return Promise.reject(normalizeError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

/**
 * Normalizes Axios errors into a consistent shape.
 */
function normalizeError(error) {
  return {
    message:
      error.response?.data?.message || error.message || "An error occurred",
    status: error.response?.status,
    data: error.response?.data,
  };
}

// Register token event handlers for proactive refresh
onTokenEvents({
  onRefreshed: () => {
    // Token was proactively refreshed — nothing to do
  },
  onRefreshFailed: () => {
    // Proactive refresh failed — user will be redirected on next 401
  },
});

export { apiClient };
