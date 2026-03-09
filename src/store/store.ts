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
import authReducer from "./slices/authSlice";
import { api } from "./services/baseApi";

// Lazy storage proxy — always the same object shape on both server and client.
// Actual localStorage calls only execute client-side (window is available).
const storage = {
  getItem(key: string) {
    if (typeof window === "undefined") return Promise.resolve(null);
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") return Promise.resolve();
    try {
      return Promise.resolve(localStorage.setItem(key, value));
    } catch {
      return Promise.resolve();
    }
  },
  removeItem(key: string) {
    if (typeof window === "undefined") return Promise.resolve();
    try {
      return Promise.resolve(localStorage.removeItem(key));
    } catch {
      return Promise.resolve();
    }
  },
};

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "accessToken", "isAuthenticated"],
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
