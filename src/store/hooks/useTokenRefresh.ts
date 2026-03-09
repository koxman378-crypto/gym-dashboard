"use client";

import { useEffect, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "../hooks";
import { logout, setCredentials } from "../slices/authSlice";

/**
 * Hook to automatically refresh access token on app load.
 * Returns isRefreshing = true while the refresh attempt is in-flight,
 * so callers can hold redirects until the result is known.
 */
export function useTokenRefresh() {
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((state) => state.auth);
  const hasAttemptedRefresh = useRef(false);
  // Start as "refreshing" only when there IS a persisted user but no token yet
  const needsRefresh = !!user && !accessToken;
  const [isRefreshing, setIsRefreshing] = useState(needsRefresh);

  useEffect(() => {
    const refreshToken = async () => {
      // Skip if already attempted refresh in this session
      if (hasAttemptedRefresh.current) return;

      // Skip if we already have an access token
      if (accessToken) {
        setIsRefreshing(false);
        return;
      }

      // Skip if no user is persisted (user logged out cleanly)
      if (!user) {
        setIsRefreshing(false);
        return;
      }

      hasAttemptedRefresh.current = true;
      setIsRefreshing(true);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/refresh`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!response.ok) {
          dispatch(logout());
          return;
        }

        const data = await response.json();

        if (data.accessToken && data.user) {
          dispatch(
            setCredentials({
              accessToken: data.accessToken,
              user: {
                id: data.user._id,
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
          dispatch(logout());
        }
      } catch {
        dispatch(logout());
      } finally {
        setIsRefreshing(false);
      }
    };

    refreshToken();
  }, [user, accessToken, dispatch]);

  return { isRefreshing };
}
