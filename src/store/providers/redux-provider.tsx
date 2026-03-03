"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store";

/**
 * Redux Provider with Redux Persist
 * - Access token stored in memory only (not persisted)
 * - User info and auth status persisted to localStorage
 * - Refresh token stored in HTTP-only cookie (backend managed)
 */
export function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
