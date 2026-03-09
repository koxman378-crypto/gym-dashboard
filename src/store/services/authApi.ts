import { api } from "./baseApi";
import { setCredentials, logout } from "../slices/authSlice";
import { Role } from "@/src/types/type";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  age?: number;
};

export type UserDto = {
  _id: string;
  email: string;
  name: string;
  nickname?: string | null;
  phone?: string | null;
  address?: string | null;
  avatar?: string | null;
  age?: number | null;
  role: Role;
  isActive: boolean;
  lastLoginAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type AuthResponse = {
  user: UserDto;
  accessToken: string;
};

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              accessToken: data.accessToken,
              user: {
                id: data.user._id,
                _id: data.user._id,
                email: data.user.email,
                name: data.user.name,
                nickname: data.user.nickname || undefined,
                role: data.user.role,
                avatar: data.user.avatar || undefined,
                createdAt: data.user.createdAt?.toString(),
                updatedAt: data.user.updatedAt?.toString(),
                lastLoginAt: data.user.lastLoginAt?.toString(),
                isActive: data.user.isActive,
              },
            }),
          );
        } catch (error) {
        }
      },
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              accessToken: data.accessToken,
              user: {
                id: data.user._id,
                _id: data.user._id,
                email: data.user.email,
                name: data.user.name,
                nickname: data.user.nickname || undefined,
                role: data.user.role,
                avatar: data.user.avatar || undefined,
                createdAt: data.user.createdAt?.toString(),
                updatedAt: data.user.updatedAt?.toString(),
                lastLoginAt: data.user.lastLoginAt?.toString(),
                isActive: data.user.isActive,
              },
            }),
          );
        } catch (error) {
        }
      },
    }),
    getProfile: builder.query<UserDto, void>({
      query: () => ({ url: "/auth/profile", method: "GET" }),
      providesTags: ["Me"],
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (error) {
          // Even if logout fails, clear local state
          dispatch(logout());
        }
      },
    }),
    logoutAll: builder.mutation<{ message: string }, void>({
      query: () => ({ url: "/auth/logout-all", method: "POST" }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (error) {
          dispatch(logout());
        }
      },
    }),
    refresh: builder.mutation<AuthResponse, void>({
      query: () => ({ url: "/auth/refresh", method: "POST" }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              accessToken: data.accessToken,
              user: {
                id: data.user._id,
                _id: data.user._id,
                email: data.user.email,
                name: data.user.name,
                nickname: data.user.nickname || undefined,
                role: data.user.role,
                avatar: data.user.avatar || undefined,
                createdAt: data.user.createdAt?.toString(),
                updatedAt: data.user.updatedAt?.toString(),
                lastLoginAt: data.user.lastLoginAt?.toString(),
                isActive: data.user.isActive,
              },
            }),
          );
        } catch (error) {
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useLogoutAllMutation,
  useRefreshMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
} = authApi;
