
import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import authReducer, { setCredentials, setAccessToken, setUser, logout, type AuthState } from "./slices/authSlice";
import { api } from "./services/baseApi";


// Create a simple storage that works in all environments
const createStorage = () => {
  if (typeof window === "undefined") {
    // Server-side - return noop storage
    return {
      getItem(_key: string) {
        return Promise.resolve(null);
      },
      setItem(_key: string, value: string) {
        return Promise.resolve(value);
      },
      removeItem(_key: string) {
        return Promise.resolve();
      },
    };
  }

  // Client-side - use localStorage directly
  return {
    getItem(key: string) {
      try {
        return Promise.resolve(localStorage.getItem(key));
      } catch (error) {
        console.error("localStorage getItem error:", error);
        return Promise.resolve(null);
      }
    },
    setItem(key: string, value: string) {
      try {
        return Promise.resolve(localStorage.setItem(key, value));
      } catch (error) {
        console.error("localStorage setItem error:", error);
        return Promise.resolve();
      }
    },
    removeItem(key: string) {
      try {
        return Promise.resolve(localStorage.removeItem(key));
      } catch (error) {
        console.error("localStorage removeItem error:", error);
        return Promise.resolve();
      }
    },
  };
};

const storage = createStorage();

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "isAuthenticated"], // Only persist user and auth status, NOT accessToken
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
