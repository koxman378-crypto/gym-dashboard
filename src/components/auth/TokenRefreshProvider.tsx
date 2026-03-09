"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useTokenRefresh } from "@/src/store/hooks";

const RefreshContext = createContext({ isRefreshing: false });

export function useRefreshContext() {
  return useContext(RefreshContext);
}

/**
 * Runs the token refresh on app load and exposes isRefreshing via context
 * so AppLayout can hold redirects until the result is known.
 */
export function TokenRefreshProvider({ children }: { children: ReactNode }) {
  const { isRefreshing } = useTokenRefresh();
  return (
    <RefreshContext.Provider value={{ isRefreshing }}>
      {children}
    </RefreshContext.Provider>
  );
}
