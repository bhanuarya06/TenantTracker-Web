/**
 * OAuth 2.0 + OIDC Provider Configuration
 *
 * Production-grade configuration for OAuth providers.
 * Uses Authorization Code Flow with PKCE as recommended by:
 * - OAuth 2.0 for Browser-Based Apps (RFC draft)
 * - OAuth 2.0 Security Best Current Practice (RFC 9700)
 *
 * BFF Pattern: The frontend initiates the flow, but the actual token exchange
 * happens on the backend (confidential client). This prevents client_secret
 * exposure and enables httpOnly cookie-based token storage.
 *
 * Environment variables are read from Vite's import.meta.env.
 */

const OAUTH_REDIRECT_BASE =
  import.meta.env.VITE_OAUTH_REDIRECT_BASE || window.location.origin;

export const OAUTH_PROVIDERS = {
  google: {
    name: "Google",
    clientId:
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      "1035117656712-28vjs5nmfv6b0clcega6nn6ooer41vc2.apps.googleusercontent.com",
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token", // Used by backend only
    userInfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo", // Used by backend only
    jwksUri: "https://www.googleapis.com/oauth2/v3/certs", // Used by backend for ID token validation
    issuer: "https://accounts.google.com",
    redirectUri: `${OAUTH_REDIRECT_BASE}/auth/callback/google`,
    // OIDC scopes: openid (required), profile, email
    // Only request what you need (principle of least privilege)
    scopes: ["openid", "profile", "email"],
    // S256 is the only acceptable method; plain is deprecated
    codeChallengeMethod: "S256",
    // response_type: 'code' for Authorization Code Flow
    responseType: "code",
    icon: "google",
  },

  github: {
    name: "GitHub",
    clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || "",
    authorizationEndpoint: "https://github.com/login/oauth/authorize",
    tokenEndpoint: "https://github.com/login/oauth/access_token", // Used by backend only
    userInfoEndpoint: "https://api.github.com/user", // Used by backend only
    // GitHub doesn't support OIDC natively, but we use state for CSRF
    issuer: null,
    redirectUri: `${OAUTH_REDIRECT_BASE}/auth/callback/github`,
    scopes: ["read:user", "user:email"],
    codeChallengeMethod: null, // GitHub doesn't support PKCE yet
    responseType: "code",
    icon: "github",
  },
};

/**
 * Backend OAuth endpoints.
 * The BFF pattern means the backend handles token exchange.
 * Frontend only redirects to the provider and receives the callback.
 */
export const OAUTH_API_ENDPOINTS = {
  // Backend initiates OAuth - returns the authorization URL
  // (Alternative: frontend constructs the URL, which is what we do)
  AUTHORIZE: (provider) => `/auth/oauth/${provider}/authorize`,

  // Backend exchanges the authorization code for tokens (BFF pattern)
  CALLBACK: (provider) => `/auth/oauth/${provider}/callback`,

  // Backend refreshes the access token using the refresh token
  REFRESH: "/auth/token/refresh",

  // Backend revokes all tokens (logout)
  REVOKE: "/auth/token/revoke",

  // Backend returns the current user from the session/token
  ME: "/auth/me",

  // Link an OAuth provider to an existing account
  LINK: (provider) => `/auth/oauth/${provider}/link`,

  // Unlink an OAuth provider from an account
  UNLINK: (provider) => `/auth/oauth/${provider}/unlink`,
};

/**
 * Token configuration.
 * Access tokens are stored in-memory only (not localStorage).
 * Refresh tokens are stored in httpOnly secure cookies by the backend.
 */
export const TOKEN_CONFIG = {
  // Refresh the access token this many ms before it expires
  // e.g., if token expires in 15min, refresh at 14min mark
  REFRESH_BUFFER_MS: 60 * 1000, // 1 minute before expiry

  // Maximum time to wait for a silent refresh
  REFRESH_TIMEOUT_MS: 10 * 1000, // 10 seconds

  // How often to check if the token needs refreshing (polling interval)
  REFRESH_CHECK_INTERVAL_MS: 30 * 1000, // 30 seconds

  // Maximum number of refresh retries on failure
  MAX_REFRESH_RETRIES: 3,
};
