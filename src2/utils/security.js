/**
 * Security utilities for OAuth 2.0 + OIDC authentication.
 *
 * Implements:
 * - PKCE (RFC 7636): code_verifier + code_challenge generation
 * - State parameter: CSRF protection for OAuth flows
 * - Nonce: Replay attack prevention for OIDC ID tokens
 * - Secure random generation using Web Crypto API
 *
 * All values are stored in sessionStorage (not localStorage) because:
 * - They are short-lived (only needed during the OAuth redirect flow)
 * - sessionStorage is tab-scoped, preventing cross-tab leakage
 * - They are cleared automatically when the tab closes
 */

const STORAGE_KEYS = {
  CODE_VERIFIER: "oauth_code_verifier",
  STATE: "oauth_state",
  NONCE: "oauth_nonce",
  RETURN_URL: "oauth_return_url",
  PROVIDER: "oauth_provider",
};

// --- Cryptographic helpers (Web Crypto API) ---

/**
 * Generates a cryptographically secure random string.
 * Uses crypto.getRandomValues() which is CSPRNG-backed.
 * Output: URL-safe base64 (A-Z, a-z, 0-9, -, _) with no padding.
 *
 * @param {number} length - byte length (default 32 = 256 bits of entropy)
 * @returns {string}
 */
function generateRandomString(length = 32) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * URL-safe Base64 encoding (RFC 4648 §5).
 * No padding characters, safe for use in URLs and OAuth parameters.
 */
function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * SHA-256 hash using SubtleCrypto.
 * @param {string} plain
 * @returns {Promise<ArrayBuffer>}
 */
async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

// --- PKCE (RFC 7636) ---

/**
 * Generates a PKCE code verifier.
 * Per spec: 43-128 characters, using [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
 * We use 32 random bytes → 43 base64url characters (256 bits of entropy).
 */
export function generateCodeVerifier() {
  return generateRandomString(32);
}

/**
 * Derives the PKCE code challenge from a code verifier.
 * Method: S256 (SHA-256 hash, then base64url encode)
 * S256 is required by most providers; plain is deprecated.
 */
export async function generateCodeChallenge(codeVerifier) {
  const hashed = await sha256(codeVerifier);
  return base64UrlEncode(hashed);
}

// --- State parameter (CSRF protection) ---

/**
 * Generates an opaque state value for CSRF protection.
 * This value is sent in the authorization request and verified on callback.
 * 16 bytes = 128 bits of entropy (sufficient for CSRF tokens).
 */
export function generateState() {
  return generateRandomString(16);
}

// --- Nonce (OIDC replay protection) ---

/**
 * Generates a nonce for OIDC ID token replay protection.
 * The nonce is included in the auth request and must match the `nonce` claim
 * in the returned ID token.
 * 16 bytes = 128 bits of entropy.
 */
export function generateNonce() {
  return generateRandomString(16);
}

// --- Secure sessionStorage management ---

/**
 * Stores all OAuth flow parameters in sessionStorage.
 * Called just before redirecting to the authorization server.
 */
export function storeOAuthParams({
  codeVerifier,
  state,
  nonce,
  returnUrl,
  provider,
}) {
  try {
    sessionStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);
    sessionStorage.setItem(STORAGE_KEYS.STATE, state);
    sessionStorage.setItem(STORAGE_KEYS.NONCE, nonce);
    sessionStorage.setItem(STORAGE_KEYS.RETURN_URL, returnUrl || "/dashboard");
    sessionStorage.setItem(STORAGE_KEYS.PROVIDER, provider);
  } catch {
    // sessionStorage might be unavailable in some privacy modes
    console.error("Failed to store OAuth parameters in sessionStorage");
  }
}

/**
 * Retrieves stored OAuth parameters from sessionStorage.
 * Called on the callback page to validate the response.
 */
export function getStoredOAuthParams() {
  try {
    return {
      codeVerifier: sessionStorage.getItem(STORAGE_KEYS.CODE_VERIFIER),
      state: sessionStorage.getItem(STORAGE_KEYS.STATE),
      nonce: sessionStorage.getItem(STORAGE_KEYS.NONCE),
      returnUrl:
        sessionStorage.getItem(STORAGE_KEYS.RETURN_URL) || "/dashboard",
      provider: sessionStorage.getItem(STORAGE_KEYS.PROVIDER),
    };
  } catch {
    return {
      codeVerifier: null,
      state: null,
      nonce: null,
      returnUrl: "/dashboard",
      provider: null,
    };
  }
}

/**
 * Clears all stored OAuth parameters.
 * Must be called after the callback is processed (success or failure).
 */
export function clearOAuthParams() {
  try {
    Object.values(STORAGE_KEYS).forEach((key) =>
      sessionStorage.removeItem(key),
    );
  } catch {
    // Ignore errors
  }
}

/**
 * Validates the state parameter returned from the authorization server.
 * Prevents CSRF attacks by ensuring the state matches what we sent.
 *
 * @param {string} returnedState - state from the authorization response
 * @returns {boolean}
 */
export function validateState(returnedState) {
  const stored = getStoredOAuthParams();
  if (!stored.state || !returnedState) return false;
  // Constant-time comparison isn't critical here (both are random),
  // but we do a strict equality check.
  return stored.state === returnedState;
}
