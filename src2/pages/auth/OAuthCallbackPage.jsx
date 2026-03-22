/**
 * OAuth Callback Page
 *
 * This page handles the redirect back from OAuth providers (Google, GitHub).
 * It processes the authorization code and completes the authentication flow.
 *
 * URL pattern: /auth/callback/:provider?code=...&state=...
 *
 * Security checks performed:
 * 1. Validates the state parameter (CSRF protection)
 * 2. Sends code + code_verifier to backend (PKCE verification)
 * 3. Backend validates ID token (signature, issuer, audience, nonce, expiry)
 * 4. On success: stores access token in memory, redirects to dashboard
 * 5. On failure: shows error, redirects to login
 */

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleOAuthCallback } from "../../services/oauthService.js";
import { setAccessToken } from "../../services/tokenManager.js";
import {
  setUser,
  setUserType,
  setAuthProvider,
  setLinkedProviders,
  setError,
} from "../../store/slices/authSlice.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.jsx";
import toast from "react-hot-toast";

export const OAuthCallbackPage = () => {
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("processing"); // processing | error
  const [errorMessage, setErrorMessage] = useState("");
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double-processing in React StrictMode
    if (processedRef.current) return;
    processedRef.current = true;

    async function processCallback() {
      try {
        const result = await handleOAuthCallback(provider, searchParams);

        if (result.success) {
          const { user, token, expiresIn, linkedProviders } = result.data;

          // Store access token in memory
          if (token) {
            setAccessToken(token, expiresIn || 900);
          }

          // Update Redux state
          if (user) {
            dispatch(setUser(user));
            dispatch(setUserType(user.role || "owner"));
            dispatch(setAuthProvider(provider));
            if (linkedProviders) {
              dispatch(setLinkedProviders(linkedProviders));
            }
          }

          toast.success(
            `Signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`,
          );

          // Redirect to the originally requested page or dashboard
          const returnUrl = result.returnUrl || "/dashboard";
          navigate(returnUrl, { replace: true });
        } else {
          setStatus("error");
          setErrorMessage(result.error || "Authentication failed");
          dispatch(setError(result.error));
          toast.error(result.error || "Authentication failed");
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(err.message || "An unexpected error occurred");
        dispatch(setError(err.message));
        toast.error("Authentication failed");
      }
    }

    processCallback();
  }, [provider, searchParams, navigate, dispatch]);

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Authentication Failed
          </h2>
          <p className="text-gray-600">{errorMessage}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </button>
            <button
              onClick={() => navigate("/", { replace: true })}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Processing state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <h2 className="text-xl font-semibold text-gray-700">
          Completing sign in with{" "}
          {provider?.charAt(0).toUpperCase() + provider?.slice(1)}...
        </h2>
        <p className="text-gray-500">
          Please wait while we verify your identity.
        </p>
      </div>
    </div>
  );
};
