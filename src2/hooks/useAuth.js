/**
 * useAuth Hook — Central authentication orchestrator
 *
 * Manages both traditional email/password and OAuth 2.0 + OIDC flows.
 *
 * Key differences from typical implementations:
 * 1. Tokens are NEVER stored in localStorage (in-memory only via tokenManager)
 * 2. On page refresh, silent re-authentication happens via httpOnly cookie
 * 3. OAuth flow is initiated here, callback is handled by OAuthCallbackPage
 * 4. All token management is delegated to tokenManager.js
 */

import { useSelector, useDispatch } from "react-redux";
import { useCallback, useRef } from "react";
import { authService } from "../services/authService";
import { setAccessToken, clearTokens } from "../services/tokenManager.js";
import {
  setLoading,
  setUser,
  clearUser,
  setError,
  setUserType,
  setAuthProvider,
  setLinkedProviders,
  selectUser,
  selectUserType,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthProvider,
  selectLinkedProviders,
} from "../store/slices/authSlice";
import { clearUserData } from "../store/slices/userSlice";
import toast from "react-hot-toast";

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const userType = useSelector(selectUserType);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const authProvider = useSelector(selectAuthProvider);
  const linkedProviders = useSelector(selectLinkedProviders);
  const initializationRef = useRef(false);

  /**
   * Initialize auth state on app load.
   * Attempts to restore the session via:
   * 1. httpOnly refresh token cookie → silent refresh → access token in memory
   * 2. Falls back to /auth/profile to check if the cookie session is valid
   *
   * This is called by AppLayout on mount.
   */
  const initializeAuth = useCallback(async () => {
    // Only run once per app mount — ref never resets
    if (initializationRef.current) {
      return;
    }

    const currentPath = window.location.pathname;
    if (
      currentPath.includes("/login") ||
      currentPath.includes("/register") ||
      currentPath.includes("/auth/callback")
    ) {
      return;
    }

    initializationRef.current = true;

    try {
      dispatch(setLoading(true));

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 10000),
      );

      const userData = await Promise.race([
        authService.getCurrentUser(),
        timeoutPromise,
      ]);

      const resolvedUser =
        userData.data?.user || userData.user || userData.data || userData;

      if (
        resolvedUser &&
        resolvedUser.email &&
        resolvedUser.role &&
        (resolvedUser.id || resolvedUser._id)
      ) {
        dispatch(setUser(resolvedUser));
        dispatch(setUserType(resolvedUser.role));

        // If the response includes token info, store it in memory
        if (userData.data?.token) {
          setAccessToken(userData.data.token, userData.data.expiresIn || 900);
        }

        // Track linked OAuth providers if returned
        if (resolvedUser.linkedProviders) {
          dispatch(setLinkedProviders(resolvedUser.linkedProviders));
        }
        if (resolvedUser.authProvider) {
          dispatch(setAuthProvider(resolvedUser.authProvider));
        }
      } else {
        dispatch(clearUser());
      }
    } catch {
      dispatch(clearUser());
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Email/password login.
   * Token is stored in memory by authService.processAuthResponse().
   */
  const login = useCallback(
    async (loginData) => {
      try {
        dispatch(setLoading(true));

        const requestData = {
          ...loginData,
          role: userType,
        };

        const response = await authService.login(requestData);

        if (response.success && response.data) {
          const userData = response.data.user;

          if (userData && userData.email && userData.role) {
            dispatch(setUser(userData));
            dispatch(setUserType(userData.role));
            dispatch(setAuthProvider(null)); // Email/password login

            toast.success("Login successful!");
            return { success: true, data: userData };
          } else {
            throw new Error("Invalid user data received from server");
          }
        } else {
          throw new Error(response.message || "Login failed");
        }
      } catch (error) {
        dispatch(setError(error.message));
        toast.error(error.message);
        return { success: false, error: error.message };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, userType],
  );

  /**
   * Email/password registration.
   */
  const register = useCallback(
    async (userData) => {
      try {
        dispatch(setLoading(true));

        const registerData = {
          ...userData,
          role: userType,
        };

        const response = await authService.register(registerData);

        if (response.success && response.data) {
          const newUser = response.data.user;

          if (newUser && newUser.email && newUser.role) {
            dispatch(setUser(newUser));
            dispatch(setUserType(newUser.role));
            dispatch(setAuthProvider(null));

            toast.success("Registration successful!");
            return { success: true, data: newUser };
          } else {
            throw new Error("Invalid user data received from server");
          }
        } else {
          throw new Error(response.message || "Registration failed");
        }
      } catch (error) {
        dispatch(setError(error.message));
        toast.error(error.message);
        return { success: false, error: error.message };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, userType],
  );

  /**
   * Logout — clears tokens (in-memory + httpOnly cookie via backend) and Redux state.
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      dispatch(clearUser());
      dispatch(clearUserData());
      clearTokens();
      toast.success("Logged out successfully");
    } catch {
      // Always clear local state even if server logout fails
      dispatch(clearUser());
      dispatch(clearUserData());
      clearTokens();
      toast.error("Logout failed, but you have been logged out locally");
    }
  }, [dispatch]);

  /**
   * Update user profile.
   */
  const updateProfile = useCallback(
    async (profileData) => {
      try {
        dispatch(setLoading(true));
        const response = await authService.updateProfile(profileData);

        if (response.success && response.data) {
          const updatedUser = response.data.user;

          if (updatedUser && updatedUser.email && updatedUser.role) {
            dispatch(setUser(updatedUser));
            dispatch(setUserType(updatedUser.role));

            toast.success("Profile updated successfully!");
            return { success: true, data: updatedUser };
          } else {
            throw new Error("Invalid user data received from server");
          }
        } else {
          throw new Error(response.message || "Profile update failed");
        }
      } catch (error) {
        dispatch(setError(error.message));
        toast.error(error.message);
        return { success: false, error: error.message };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch],
  );

  return {
    user,
    userType,
    isAuthenticated,
    isLoading,
    authProvider,
    linkedProviders,
    initializeAuth,
    login,
    register,
    logout,
    updateProfile,
  };
};
