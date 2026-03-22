import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "../config/api";
import { OAUTH_API_ENDPOINTS } from "../config/oauth.js";
import { setAccessToken, clearTokens } from "./tokenManager.js";

/**
 * Processes an auth response from the backend.
 * Extracts the access token and stores it in memory.
 * The backend also sets the refresh token as an httpOnly cookie.
 */
function processAuthResponse(responseData) {
  if (responseData?.success && responseData?.data) {
    const { token, expiresIn } = responseData.data;
    if (token) {
      // Store access token in memory (NOT localStorage)
      setAccessToken(token, expiresIn || 900); // Default 15 min
    }
  }
  return responseData;
}

export const authService = {
  async login(credentials) {
    const loginData = {
      ...credentials,
      role: credentials.role || "owner",
    };
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, loginData);
    return processAuthResponse(response.data);
  },

  async register(userData) {
    const registerData = {
      ...userData,
      role: userData.role || "owner",
    };
    const response = await apiClient.post(API_ENDPOINTS.REGISTER, registerData);
    return processAuthResponse(response.data);
  },

  async logout() {
    try {
      // Revoke tokens on the server (invalidates refresh token cookie)
      await apiClient.post(OAUTH_API_ENDPOINTS.REVOKE);
    } catch {
      // If revocation fails, still try the regular logout
    }
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGOUT);
      return response.data;
    } finally {
      // Always clear client-side tokens regardless of server response
      clearTokens();
    }
  },

  async getCurrentUser() {
    const response = await apiClient.get(API_ENDPOINTS.PROFILE);
    return response.data;
  },

  async updateProfile(userData) {
    const response = await apiClient.put(
      API_ENDPOINTS.UPDATE_PROFILE,
      userData,
    );
    return response.data;
  },
};

/**
 * Refreshes the access token using the httpOnly refresh token cookie.
 * Called by the tokenManager when the access token is about to expire.
 *
 * This function is separate from authService to avoid circular dependencies
 * (tokenManager imports this, apiClient imports tokenManager).
 */
export async function refreshAccessToken() {
  // This request includes the httpOnly cookie automatically (withCredentials: true)
  // The backend validates the refresh token and returns a new access token
  const response = await apiClient.post(OAUTH_API_ENDPOINTS.REFRESH);
  const data = response.data;

  if (data?.success && data?.data?.token) {
    return {
      token: data.data.token,
      expiresIn: data.data.expiresIn || 900,
    };
  }

  throw new Error("Token refresh failed");
}
