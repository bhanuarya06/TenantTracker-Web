/**
 * OAuth 2.0 Service
 *
 * Orchestrates the OAuth Authorization Code Flow with PKCE.
 *
 * Flow (Frontend perspective):
 * 1. User clicks "Sign in with Google/GitHub"
 * 2. We generate PKCE (code_verifier + code_challenge), state, nonce
 * 3. Store them in sessionStorage (tab-scoped, short-lived)
 * 4. Redirect user to provider's authorization endpoint
 * 5. Provider authenticates user, redirects back with ?code=...&state=...
 * 6. OAuthCallbackPage picks up the code
 * 7. Sends code + code_verifier to OUR BACKEND (BFF pattern)
 * 8. Backend exchanges code for tokens (keeps refresh token, returns access token)
 * 9. Frontend stores access token in memory, backend sets httpOnly cookie
 *
 * This implements the BFF (Backend for Frontend) pattern because:
 * - SPAs cannot securely store client_secret
 * - Refresh tokens should never be accessible to JavaScript
 * - httpOnly cookies are immune to XSS
 */

import { OAUTH_PROVIDERS, OAUTH_API_ENDPOINTS } from "../config/oauth.js";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  generateNonce,
  storeOAuthParams,
  getStoredOAuthParams,
  clearOAuthParams,
  validateState,
} from "../utils/security.js";
import { apiClient } from "./apiClient.js";

/**
 * Initiates the OAuth authorization flow.
 * Generates all security parameters and redirects the user.
 *
 * @param {string} provider - 'google' | 'github'
 * @param {string} returnUrl - URL to return to after successful auth
 */
export async function initiateOAuthFlow(provider, returnUrl = "/dashboard") {
  const config = OAUTH_PROVIDERS[provider];
  if (!config) {
    throw new Error(`Unknown OAuth provider: ${provider}`);
  }

  if (!config.clientId) {
    throw new Error(
      `OAuth client ID not configured for ${provider}. Set VITE_${provider.toUpperCase()}_CLIENT_ID`,
    );
  }

  // Generate PKCE pair
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Generate CSRF state and OIDC nonce
  const state = generateState();
  const nonce = generateNonce();

  // Store parameters for validation on callback
  storeOAuthParams({ codeVerifier, state, nonce, returnUrl, provider });

  // Build the authorization URL
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: config.responseType,
    scope: config.scopes.join(" "),
    state,
    nonce,
  });

  // Add PKCE challenge if provider supports it
  if (config.codeChallengeMethod) {
    params.set("code_challenge", codeChallenge);
    params.set("code_challenge_method", config.codeChallengeMethod);
  }

  // Google-specific: prompt for account selection, enable offline access
  if (provider === "google") {
    params.set("access_type", "offline"); // Gets refresh token
    params.set("prompt", "consent"); // Forces consent screen
  }

  const authorizationUrl = `${config.authorizationEndpoint}?${params.toString()}`;

  // Redirect to authorization server
  window.location.href = authorizationUrl;
}

/**
 * Handles the OAuth callback after the provider redirects back.
 * Validates security parameters and exchanges the code via the backend.
 *
 * @param {string} provider - 'google' | 'github'
 * @param {URLSearchParams} searchParams - query params from the callback URL
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function handleOAuthCallback(provider, searchParams) {
  try {
    // Check for errors from the provider
    const error = searchParams.get("error");
    if (error) {
      const errorDescription =
        searchParams.get("error_description") || "Authorization failed";
      clearOAuthParams();
      return {
        success: false,
        error: `${error}: ${errorDescription}`,
      };
    }

    // Extract the authorization code
    const code = searchParams.get("code");
    const returnedState = searchParams.get("state");

    if (!code) {
      clearOAuthParams();
      return { success: false, error: "No authorization code received" };
    }

    // Validate the state parameter (CSRF protection)
    if (!validateState(returnedState)) {
      clearOAuthParams();
      return {
        success: false,
        error: "Invalid state parameter. Possible CSRF attack.",
      };
    }

    // Retrieve stored PKCE verifier and other params
    const stored = getStoredOAuthParams();
    if (!stored.codeVerifier) {
      clearOAuthParams();
      return {
        success: false,
        error: "Missing PKCE code verifier. Please try again.",
      };
    }

    // Send code + code_verifier to our backend for token exchange (BFF pattern)
    // The backend will:
    // 1. Exchange code for tokens with the provider
    // 2. Validate the ID token (signature, issuer, audience, nonce, expiry)
    // 3. Create/update the user in our database
    // 4. Set refresh_token in httpOnly cookie
    // 5. Return access_token + user data in the response body
    const response = await apiClient.post(
      OAUTH_API_ENDPOINTS.CALLBACK(provider),
      {
        code,
        code_verifier: stored.codeVerifier,
        nonce: stored.nonce,
        redirect_uri: OAUTH_PROVIDERS[provider].redirectUri,
      },
    );

    // Clean up stored OAuth params
    clearOAuthParams();

    if (response.data?.success) {
      return {
        success: true,
        data: response.data.data,
        returnUrl: stored.returnUrl,
      };
    }

    return {
      success: false,
      error: response.data?.message || "OAuth authentication failed",
    };
  } catch (err) {
    clearOAuthParams();
    return {
      success: false,
      error: err.message || "OAuth callback processing failed",
    };
  }
}

/**
 * Links an OAuth provider to the current user's account.
 * Used when a user wants to add Google/GitHub login to their existing account.
 */
export async function linkOAuthProvider(provider, returnUrl) {
  // Same flow as login, but the backend links instead of creating a new user
  const url = new URL(window.location.href);
  url.pathname = `/auth/callback/${provider}`;

  // Use a modified return URL that indicates linking
  return initiateOAuthFlow(provider, returnUrl || "/profile?linked=true");
}

/**
 * Unlinks an OAuth provider from the current user's account.
 */
export async function unlinkOAuthProvider(provider) {
  const response = await apiClient.delete(OAUTH_API_ENDPOINTS.UNLINK(provider));
  return response.data;
}

/**
 * Returns available OAuth providers that are configured (have client IDs).
 */
export function getAvailableProviders() {
  return Object.entries(OAUTH_PROVIDERS)
    .filter(([, config]) => config.clientId)
    .map(([key, config]) => ({
      id: key,
      name: config.name,
      icon: config.icon,
    }));
}
