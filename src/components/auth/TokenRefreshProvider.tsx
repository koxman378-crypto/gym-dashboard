"use client";

import { useTokenRefresh } from "@/src/store/hooks";

/**
 * Component that handles automatic token refresh on app load
 * Add this to your root layout to enable persistent login sessions
 */
export function TokenRefreshProvider() {
  useTokenRefresh();
  return null;
}
