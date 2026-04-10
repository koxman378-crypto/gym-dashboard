import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
  createApi,
} from "@reduxjs/toolkit/query/react";
import {
  logout,
  setAccessToken,
  setUser,
  type AuthState,
} from "../slices/authSlice";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4000/api";

// Public base query - no access token required, but sends cookies (for refresh token endpoint)
export const publicBaseQuery = fetchBaseQuery({
  baseUrl: BACKEND_URL,
  credentials: "include", // This ensures cookies (including refreshToken) are sent
  timeout: 10000, // 10 seconds timeout
});

// Authenticated base query - includes access token
const authenticatedBaseQuery = fetchBaseQuery({
  baseUrl: BACKEND_URL,
  credentials: "include",
  timeout: 10000, // 10 seconds timeout
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Helper function to handle logout and redirect
const handleLogout = (api: any) => {
  api.dispatch(logout());
  if (typeof window !== "undefined") {
    window.location.href = "/auth/login";
  }
};

// Mutex to prevent multiple simultaneous refresh attempts
let refreshPromise: Promise<any> | null = null;

// Helper function to refresh access token
// Uses publicBaseQuery because refresh endpoint requires refreshToken cookie (not access token)
const refreshAccessToken = async (
  api: any,
  extraOptions: any,
): Promise<{ accessToken?: string; user?: any } | null> => {
  // If a refresh is already in progress, wait for it
  if (refreshPromise) {
    return await refreshPromise;
  }

  // Start new refresh attempt
  refreshPromise = (async () => {
    try {
      const refreshResult = await publicBaseQuery(
        { url: "/auth/refresh", method: "POST" },
        api,
        extraOptions,
      );

      if (refreshResult.error) {
        return null;
      }

      if (refreshResult.data) {
        const data = refreshResult.data as { accessToken?: string; user?: any };
        if (data.accessToken) {
          return data;
        }
      }

      return null;
    } finally {
      // Clear the promise after completion (success or failure)
      refreshPromise = null;
    }
  })();

  return await refreshPromise;
};

// Base query with reauth logic for authenticated endpoints
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const url = typeof args === "string" ? args : args.url;

  // Refresh endpoint uses publicBaseQuery (sends cookies, no access token needed)
  // This prevents infinite loop and correctly sends refreshToken cookie
  if (url === "/auth/refresh") {
    return await publicBaseQuery(args, api, extraOptions);
  }

  // Make initial request with access token
  let result = await authenticatedBaseQuery(args, api, extraOptions);

  // Handle timeout errors
  if (
    result.error?.status === "TIMEOUT_ERROR" ||
    (result.error &&
      "error" in result.error &&
      result.error.error === "TIMEOUT_ERROR")
  ) {
    return result;
  }

  // If 401 Unauthorized, try to refresh token
  if (result.error?.status === 401) {
    const refreshData = await refreshAccessToken(api, extraOptions);

    if (refreshData?.accessToken) {
      // Update token and user in store
      api.dispatch(setAccessToken(refreshData.accessToken));
      if (refreshData.user) {
        // Transform user data to match AuthUser type
        // Backend always returns _id as string (not ObjectId)
        const transformedUser = {
          id: refreshData.user._id, // id is alias for _id
          _id: refreshData.user._id,
          email: refreshData.user.email,
          name: refreshData.user.name,
          nickname: refreshData.user.nickname || undefined,
          role: refreshData.user.role,
          avatar: refreshData.user.avatar || undefined,
          createdAt: refreshData.user.createdAt?.toString(),
          updatedAt: refreshData.user.updatedAt?.toString(),
          lastLoginAt: refreshData.user.lastLoginAt?.toString(),
          isActive: refreshData.user.isActive,
        };
        api.dispatch(setUser(transformedUser));
      }

      // Retry original request with new token
      result = await authenticatedBaseQuery(args, api, extraOptions);
    } else {
      // Refresh failed - logout user only if we're not already on /auth/refresh endpoint
      handleLogout(api);
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Me",
    "Categories",
    "Articles",
    "Tags",
    "User",
    "Staff",
    "Customer",
    "Trainer",
    "Statistics",
    "Plan",
    "Subscription",
    "Attendance",
    "GymPrice",
    "OtherService",
    "GymProfile",
    "Faq",
    "ExpiryPreset",
  ],
  endpoints: () => ({}),
});
