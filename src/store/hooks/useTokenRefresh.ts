"use client";

import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../hooks";
import { logout, setCredentials } from "../slices/authSlice";

/**
 * Hook to automatically refresh access token on app load
 * This allows users to stay logged in across page reloads without storing access token in localStorage
 * - Refresh token is stored in HTTP-only cookie (handled by backend)
 * - Access token is stored in Redux state (memory only)
 * - On app reload, if user exists but no access token, call refresh endpoint
 */
export function useTokenRefresh() {
  const dispatch = useAppDispatch();
  const { user, accessToken, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );
  const hasAttemptedRefresh = useRef(false);

  useEffect(() => {
    const refreshToken = async () => {
      // Skip if already attempted refresh in this session
      if (hasAttemptedRefresh.current) return;

      // Skip if we already have an access token
      if (accessToken) return;

      // Skip if no user is persisted (user logged out)
      if (!user) return;

      hasAttemptedRefresh.current = true;

      try {
        // Call refresh endpoint - it will use the HTTP-only cookie
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/refresh`,
          {
            method: "POST",
            credentials: "include", // Important: send cookies
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          // Refresh token expired or invalid - logout user
          dispatch(logout());
          return;
        }

        const data = await response.json();

        // Update Redux state with new access token and user data
        // Backend always returns _id as string (not ObjectId)
        if (data.accessToken && data.user) {
          dispatch(
            setCredentials({
              accessToken: data.accessToken,
              user: {
                id: data.user._id, // id is alias for _id
                _id: data.user._id,
                email: data.user.email,
                name: data.user.name,
                role: data.user.role,
                avatar: data.user.avatar,
                createdAt: data.user.createdAt?.toString(),
                updatedAt: data.user.updatedAt?.toString(),
                lastLoginAt: data.user.lastLoginAt?.toString(),
                isActive: data.user.isActive,
              },
            }),
          );
        } else {
          // Invalid response - logout
          dispatch(logout());
        }
      } catch (error) {
        // Network error or refresh failed - logout user
        dispatch(logout());
      }
    };

    refreshToken();
  }, [user, accessToken, dispatch]);
}
