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

  // Transform trainerFees if present
  const trainerFees = user?.trainerFees?.map((fee: any) => ({
    _id: fee._id,
    duration: fee.duration,
    durationUnit: fee.durationUnit,
    amount: fee.amount,
    promotionType: fee.promotionType ?? null,
    promotionValue: fee.promotionValue ?? null,
    isActive: fee.isActive,
  }));

  const transformedUser = {
    ...user,
    _id: user._id, // Already string from backend
    assignedTrainer,
    trainerFees: trainerFees || undefined,
  };

  return transformedUser;
};

const transformUserArray = (users: any): User[] => {
  if (Array.isArray(users)) return users.map(transformUser);
  // Handle paginated response shape: { data: [], total, page, limit }
  if (users?.data && Array.isArray(users.data))
    return users.data.map(transformUser);
  if (users?.results && Array.isArray(users.results))
    return users.results.map(transformUser);
  return [];
};

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
      {
        data: User[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      },
      {
        isActive?: boolean;
        assignedTrainer?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => ({
        url: "/users/customers",
        params,
      }),
      providesTags: ["Customer"],
      transformResponse: (response: any, _meta, arg) => {
        let data: User[] = [];
        let total = 0;
        const page = arg.page ?? 1;
        const limit = arg.limit ?? 10;

        if (Array.isArray(response)) {
          data = response.map(transformUser);
          total = response.length;
        } else if (response?.results && Array.isArray(response.results)) {
          // Backend shape: { results, totalResults, totalPages, page, limit }
          data = response.results.map(transformUser);
          total = response.totalResults ?? response.results.length;
        } else if (response?.data && Array.isArray(response.data)) {
          data = response.data.map(transformUser);
          total = response.total ?? response.data.length;
        }

        return {
          data,
          total,
          page: response?.page ?? page,
          limit: response?.limit ?? limit,
          totalPages:
            response?.totalPages != null
              ? response.totalPages
              : Math.ceil(total / limit) || 1,
        };
      },
    }),

    // ============ TRAINERS LIST ============
    getAllTrainers: builder.query<User[], void>({
      query: () => "/users/trainers",
      providesTags: ["Trainer"],
      transformResponse: (response: any[]) => {
        const transformed = transformUserArray(response);
        return transformed;
      },
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
        "Me",
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
      invalidatesTags: ["Me", "Staff", "Customer", "Trainer", "Statistics"],
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
      {
        name?: string;
        nickname?: string;
        phone?: string;
        address?: string;
        avatar?: string;
      }
    >({
      query: (data) => ({
        url: "/users/me/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result) => [
        "Me",
        "Staff",
        "Customer",
        "Trainer",
        ...(result?._id ? [{ type: "User" as const, id: result._id }] : []),
      ],
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

    // ============ TRAINER FEES ============
    addTrainerFeeItem: builder.mutation<
      User,
      {
        trainerId: string;
        feeData: {
          duration: number;
          durationUnit: string;
          amount: number;
          promotionType?: string | null;
          promotionValue?: number | null;
          isActive?: boolean;
        };
      }
    >({
      query: ({ trainerId, feeData }) => ({
        url: `/users/${trainerId}/trainer-fees`,
        method: "POST",
        body: feeData,
      }),
      invalidatesTags: (_result, _error, { trainerId }) => [
        { type: "User", id: trainerId },
        "Trainer",
        "Staff",
      ],
      transformResponse: (response: any) => transformUser(response),
    }),

    updateTrainerFeeItem: builder.mutation<
      User,
      {
        trainerId: string;
        feeId: string;
        feeData: {
          duration: number;
          durationUnit: string;
          amount: number;
          promotionType?: string | null;
          promotionValue?: number | null;
          isActive?: boolean;
        };
      }
    >({
      query: ({ trainerId, feeId, feeData }) => ({
        url: `/users/${trainerId}/trainer-fees/${feeId}`,
        method: "PUT",
        body: feeData,
      }),
      invalidatesTags: (_result, _error, { trainerId }) => [
        { type: "User", id: trainerId },
        "Trainer",
        "Staff",
      ],
      transformResponse: (response: any) => transformUser(response),
    }),

    deleteTrainerFeeItem: builder.mutation<
      User,
      { trainerId: string; feeId: string }
    >({
      query: ({ trainerId, feeId }) => ({
        url: `/users/${trainerId}/trainer-fees/${feeId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { trainerId }) => [
        { type: "User", id: trainerId },
        "Trainer",
        "Staff",
      ],
      transformResponse: (response: any) => transformUser(response),
    }),

    toggleTrainerFeeItem: builder.mutation<
      User,
      { trainerId: string; feeId: string }
    >({
      query: ({ trainerId, feeId }) => ({
        url: `/users/${trainerId}/trainer-fees/${feeId}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, { trainerId }) => [
        { type: "User", id: trainerId },
        "Trainer",
        "Staff",
      ],
      transformResponse: (response: any) => transformUser(response),
    }),

    // Bulk replace (kept for backward compatibility)
    updateTrainerFees: builder.mutation<
      User,
      {
        trainerId: string;
        trainerFees: Array<{
          duration: number;
          durationUnit: string;
          amount: number;
          promotionType?: string | null;
          promotionValue?: number | null;
          isActive?: boolean;
        }>;
      }
    >({
      query: ({ trainerId, trainerFees }) => ({
        url: `/users/${trainerId}/trainer-fees`,
        method: "PATCH",
        body: { trainerFees },
      }),
      invalidatesTags: (_result, _error, { trainerId }) => [
        { type: "User", id: trainerId },
        "Trainer",
        "Staff",
      ],
      transformResponse: (response: any) => transformUser(response),
    }),

    getTrainerFees: builder.query<User, string>({
      query: (trainerId) => `/users/${trainerId}`,
      providesTags: (_result, _error, trainerId) => [
        { type: "User", id: trainerId },
      ],
      transformResponse: (response: any) => transformUser(response),
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
  useAddTrainerFeeItemMutation,
  useUpdateTrainerFeeItemMutation,
  useDeleteTrainerFeeItemMutation,
  useToggleTrainerFeeItemMutation,
  useUpdateTrainerFeesMutation,
  useGetTrainerFeesQuery,
} = usersApi;
