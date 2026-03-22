/**
 * Social Login Buttons Component
 *
 * Renders OAuth provider buttons (Google, GitHub) with proper UX:
 * - Only shows providers that are configured (have client IDs)
 * - Shows loading state during OAuth initiation
 * - Handles errors gracefully
 * - Uses official brand colors per provider guidelines
 */

import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  initiateOAuthFlow,
  getAvailableProviders,
} from "../../services/oauthService.js";
import toast from "react-hot-toast";

const PROVIDER_STYLES = {
  google: {
    bg: "bg-white hover:bg-gray-50",
    text: "text-gray-700",
    border: "border border-gray-300",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    ),
    label: "Google",
  },
  github: {
    bg: "bg-gray-900 hover:bg-gray-800",
    text: "text-white",
    border: "border border-gray-900",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
    label: "GitHub",
  },
};

export const SocialLoginButtons = ({ mode = "login" }) => {
  const [loadingProvider, setLoadingProvider] = useState(null);
  const location = useLocation();
  const availableProviders = getAvailableProviders();

  if (availableProviders.length === 0) {
    return null; // No providers configured — nothing to render
  }

  const handleOAuthLogin = async (providerId) => {
    try {
      setLoadingProvider(providerId);
      const returnUrl = location.state?.from || "/dashboard";
      await initiateOAuthFlow(providerId, returnUrl);
      // Browser will redirect — this code may not execute
    } catch (err) {
      toast.error(err.message || `Failed to initiate ${providerId} sign-in`);
      setLoadingProvider(null);
    }
  };

  const actionText = mode === "register" ? "Sign up" : "Sign in";

  return (
    <div className="space-y-4">
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">
            Or continue with
          </span>
        </div>
      </div>

      {/* Provider buttons */}
      <div className="grid grid-cols-1 gap-3">
        {availableProviders.map(({ id }) => {
          const style = PROVIDER_STYLES[id];
          if (!style) return null;

          const isLoading = loadingProvider === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => handleOAuthLogin(id)}
              disabled={loadingProvider !== null}
              className={`
                relative w-full flex items-center justify-center gap-3 px-4 py-2.5
                rounded-md text-sm font-medium transition-all duration-200
                ${style.bg} ${style.text} ${style.border}
                ${loadingProvider !== null ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              `}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                style.icon
              )}
              <span>
                {isLoading
                  ? "Redirecting..."
                  : `${actionText} with ${style.label}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
