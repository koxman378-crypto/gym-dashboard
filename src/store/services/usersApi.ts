import { api } from "./baseApi";
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  BodyMeasurement,
  BodyMeasurementDto,
  UserStatistics,
} from "@/src/types/type";

// Transform backend user to frontend user
// Backend always returns _id as string (not ObjectId)
const transformUser = (user: any): User => {
  const assignedTrainer =
    user?.assignedTrainer && typeof user.assignedTrainer === "object"
      ? {
          ...user.assignedTrainer,
          _id: user.assignedTrainer._id, // Already string from backend
        }
      : user?.assignedTrainer;

  return {
    ...user,
    _id: user._id, // Already string from backend
    assignedTrainer,
  };
};

const transformUserArray = (users: any[]): User[] => users.map(transformUser);

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ============ STAFF MANAGEMENT ============
    createStaff: builder.mutation<User, CreateUserDto>({
      query: (data) => ({
        url: "/users/staff",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Staff", "Trainer", "Statistics"],
      transformResponse: (response: any) => transformUser(response),
    }),

    getAllStaff: builder.query<User[], void>({
      query: () => "/users/staff",
      providesTags: ["Staff"],
      transformResponse: (response: any[]) => transformUserArray(response),
    }),

    // ============ CUSTOMER MANAGEMENT ============
    createCustomer: builder.mutation<User, CreateUserDto>({
      query: (data) => ({
        url: "/users/customer",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Customer", "Statistics"],
      transformResponse: (response: any) => transformUser(response),
    }),

    getAllCustomers: builder.query<
      User[],
      { isActive?: boolean; assignedTrainer?: string }
    >({
      query: (params) => ({
        url: "/users/customers",
        params,
      }),
      providesTags: ["Customer"],
      transformResponse: (response: any[]) => transformUserArray(response),
    }),

    // ============ TRAINERS LIST ============
    getAllTrainers: builder.query<User[], void>({
      query: () => "/users/trainers",
      providesTags: ["Trainer"],
      transformResponse: (response: any[]) => transformUserArray(response),
    }),

    // ============ SPECIFIC USER OPERATIONS ============
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "User", id }],
      transformResponse: (response: any) => transformUser(response),
    }),

    updateUser: builder.mutation<User, { id: string; data: UpdateUserDto }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        "Staff",
        "Customer",
        "Trainer",
        "Statistics",
      ],
      transformResponse: (response: any) => transformUser(response),
    }),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Staff", "Customer", "Trainer", "Statistics"],
    }),

    // ============ BODY MEASUREMENTS ============
    updateBodyMeasurements: builder.mutation<
      User,
      { customerId: string; measurements: BodyMeasurementDto }
    >({
      query: ({ customerId, measurements }) => ({
        url: `/users/${customerId}/body-measurements`,
        method: "PATCH",
        body: measurements,
      }),
      invalidatesTags: (_result, _error, { customerId }) => [
        { type: "User", id: customerId },
        "Customer",
      ],
      transformResponse: (response: any) => transformUser(response),
    }),

    getMeasurementHistory: builder.query<BodyMeasurement[], string>({
      query: (customerId) => `/users/${customerId}/body-measurements/history`,
      providesTags: (_result, _error, customerId) => [
        { type: "User", id: customerId },
      ],
    }),

    // ============ TRAINER'S CUSTOMERS ============
    getTrainerCustomers: builder.query<User[], void>({
      query: () => "/users/trainer/my-customers",
      providesTags: ["Customer"],
      transformResponse: (response: any[]) => transformUserArray(response),
    }),

    assignTrainer: builder.mutation<
      User,
      { customerId: string; trainerId: string }
    >({
      query: ({ customerId, trainerId }) => ({
        url: `/users/${customerId}/assign-trainer/${trainerId}`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, { customerId }) => [
        { type: "User", id: customerId },
        "Customer",
      ],
      transformResponse: (response: any) => transformUser(response),
    }),

    // ============ STATISTICS ============
    getStatistics: builder.query<UserStatistics, void>({
      query: () => "/users/dashboard/statistics",
      providesTags: ["Statistics"],
    }),

    // ============ PROFILE ============
    getMyProfile: builder.query<User, void>({
      query: () => "/users/me/profile",
      providesTags: ["Me"],
      transformResponse: (response: any) => transformUser(response),
    }),

    updateMyProfile: builder.mutation<
      User,
      { name?: string; nickname?: string; phone?: string; address?: string; avatar?: string }
    >({
      query: (data) => ({
        url: "/users/me/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Me"],
      transformResponse: (response: any) => transformUser(response),
    }),

    generatePresignedUrl: builder.mutation<
      { uploadUrl: string; publicUrl: string },
      { fileName: string; contentType: string }
    >({
      query: (body) => ({
        url: "/upload/profile-image",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateStaffMutation,
  useGetAllStaffQuery,
  useCreateCustomerMutation,
  useGetAllCustomersQuery,
  useGetAllTrainersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateBodyMeasurementsMutation,
  useGetMeasurementHistoryQuery,
  useGetTrainerCustomersQuery,
  useAssignTrainerMutation,
  useGetStatisticsQuery,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useGeneratePresignedUrlMutation,
} = usersApi;
