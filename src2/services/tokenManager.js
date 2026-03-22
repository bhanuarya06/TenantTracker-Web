/**
 * In-Memory Token Manager
 *
 * Production-grade token storage following OAuth 2.0 Security Best Practices:
 *
 * WHY IN-MEMORY (not localStorage):
 * - localStorage is accessible to any JS on the page → XSS can steal tokens
 * - In-memory tokens are lost on page refresh, but that's the point:
 *   the refresh token (in httpOnly cookie) silently re-authenticates
 * - This is the pattern used by Auth0, Okta, Microsoft MSAL v2
 *
 * HOW IT WORKS:
 * 1. On login/OAuth callback, backend returns access_token in response body
 *    and sets refresh_token in httpOnly, Secure, SameSite=Strict cookie
 * 2. Access token is stored here (in JS memory)
 * 3. On page refresh, access token is gone → silent refresh via cookie
 * 4. Axios interceptor attaches access token to every API request
 * 5. On 401, interceptor triggers silent refresh, retries the request
 *
 * THREAD SAFETY:
 * - Uses a refresh lock to prevent multiple concurrent refresh requests
 *   (thundering herd problem when multiple API calls fail simultaneously)
 */

import { TOKEN_CONFIG } from "../config/oauth.js";

// --- Private state (closure, not exported) ---
let accessToken = null;
let tokenExpiresAt = null; // Unix timestamp in ms
let refreshTimer = null;
let refreshPromise = null; // Dedup concurrent refresh calls
let onTokenRefreshed = null; // Callback for interceptor
let onTokenRefreshFailed = null; // Callback for auth failure

/**
 * Parses expiresIn into seconds.
 * Handles both numeric values (already seconds) and string durations like "7d", "1h", "15m", "900s".
 * Falls back to 900 seconds (15 min) if parsing fails.
 */
function parseExpiresIn(expiresIn) {
  if (typeof expiresIn === "number" && !Number.isNaN(expiresIn)) {
    return expiresIn;
  }

  if (typeof expiresIn === "string") {
    const match = expiresIn.match(/^(\d+)\s*(d|h|m|s)?$/i);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = (match[2] || "s").toLowerCase();
      switch (unit) {
        case "d":
          return value * 86400;
        case "h":
          return value * 3600;
        case "m":
          return value * 60;
        case "s":
          return value;
        default:
          return value;
      }
    }
    // Try parsing as a plain number string like "900"
    const num = Number(expiresIn);
    if (!Number.isNaN(num)) return num;
  }

  return 900; // Default 15 minutes
}

/**
 * Stores a new access token in memory.
 * @param {string} token - The access token
 * @param {number|string} expiresIn - Token lifetime in seconds or duration string (e.g. "7d", "1h")
 */
export function setAccessToken(token, expiresIn) {
  const expiresInSeconds = parseExpiresIn(expiresIn);
  accessToken = token;
  tokenExpiresAt = Date.now() + expiresInSeconds * 1000;
  scheduleRefresh(expiresInSeconds);
}

/**
 * Returns the current access token, or null if expired/missing.
 */
export function getAccessToken() {
  if (!accessToken) return null;
  if (tokenExpiresAt && Date.now() >= tokenExpiresAt) {
    // Token has expired, clear it
    accessToken = null;
    tokenExpiresAt = null;
    return null;
  }
  return accessToken;
}

/**
 * Checks if the token is close to expiring.
 */
export function isTokenExpiringSoon() {
  if (!tokenExpiresAt) return true;
  return Date.now() >= tokenExpiresAt - TOKEN_CONFIG.REFRESH_BUFFER_MS;
}

/**
 * Clears all token state. Called on logout.
 */
export function clearTokens() {
  accessToken = null;
  tokenExpiresAt = null;
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  refreshPromise = null;
}

/**
 * Registers callbacks for the token lifecycle.
 * Used by the API client interceptor.
 */
export function onTokenEvents({ onRefreshed, onRefreshFailed }) {
  onTokenRefreshed = onRefreshed;
  onTokenRefreshFailed = onRefreshFailed;
}

/**
 * Schedules a proactive token refresh before expiry.
 * This prevents 401 errors by refreshing ahead of time.
 */
function scheduleRefresh(expiresIn) {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  // Refresh 1 minute before expiry (or at half-life if short-lived)
  const refreshDelay = Math.max(
    expiresIn * 1000 - TOKEN_CONFIG.REFRESH_BUFFER_MS,
    (expiresIn * 1000) / 2,
  );

  refreshTimer = setTimeout(async () => {
    try {
      await performSilentRefresh();
    } catch {
      // Silent refresh failed; user will be redirected on next 401
    }
  }, refreshDelay);
}

/**
 * Performs a silent token refresh using the httpOnly refresh token cookie.
 * Uses a lock (refreshPromise) to deduplicate concurrent refresh calls.
 *
 * This is the "thundering herd" prevention pattern:
 * - First caller creates the promise
 * - Subsequent callers await the same promise
 * - Promise resolves/rejects for all waiters
 */
export async function performSilentRefresh() {
  // If a refresh is already in progress, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      // Dynamic import to avoid circular dependency with apiClient
      const { refreshAccessToken } = await import("../services/authService.js");
      const result = await refreshAccessToken();

      if (result.token) {
        setAccessToken(result.token, result.expiresIn || 900);
        onTokenRefreshed?.();
        return result;
      }

      throw new Error("No token in refresh response");
    } catch (error) {
      clearTokens();
      onTokenRefreshFailed?.();
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
