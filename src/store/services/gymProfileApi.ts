import { api } from "./baseApi";
import type { GymProfile, UpdateGymProfileDto } from "@/src/types/type";

export const gymProfileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGymProfile: builder.query<GymProfile, void>({
      query: () => "/gym-profile",
      providesTags: ["GymProfile"],
      transformResponse: (response: any) => ({
        _id: response?._id,
        name: response?.name ?? null,
        email: response?.email ?? null,
        phone: response?.phone ?? null,
        address: response?.address ?? null,
        logo: response?.logo ?? null,
        coverImage: response?.coverImage ?? null,
        latitude:
          response?.latitude === null || response?.latitude === undefined
            ? null
            : Number(response.latitude),
        longitude:
          response?.longitude === null || response?.longitude === undefined
            ? null
            : Number(response.longitude),
        locationLabel: response?.locationLabel ?? null,
        googleMapsUrl: response?.googleMapsUrl ?? null,
        description: response?.description ?? null,
        facebook: response?.facebook ?? null,
        instagram: response?.instagram ?? null,
        tiktok: response?.tiktok ?? null,
        multiGyms: Array.isArray(response?.multiGyms)
          ? response.multiGyms.map((item: any) => ({
              _id: item?._id ?? item?.gymId,
              name: item?.name,
              description: item?.description ?? null,
              isActive: item?.isActive ?? true,
            }))
          : [],
        isActive: response?.isActive ?? true,
        createdAt: response?.createdAt,
        updatedAt: response?.updatedAt,
      }),
    }),

    updateGymProfile: builder.mutation<GymProfile, UpdateGymProfileDto>({
      query: (data) => ({
        url: "/gym-profile",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["GymProfile"],
      transformResponse: (response: any) => ({
        _id: response?._id,
        name: response?.name ?? null,
        email: response?.email ?? null,
        phone: response?.phone ?? null,
        address: response?.address ?? null,
        logo: response?.logo ?? null,
        coverImage: response?.coverImage ?? null,
        latitude:
          response?.latitude === null || response?.latitude === undefined
            ? null
            : Number(response.latitude),
        longitude:
          response?.longitude === null || response?.longitude === undefined
            ? null
            : Number(response.longitude),
        locationLabel: response?.locationLabel ?? null,
        googleMapsUrl: response?.googleMapsUrl ?? null,
        description: response?.description ?? null,
        facebook: response?.facebook ?? null,
        instagram: response?.instagram ?? null,
        tiktok: response?.tiktok ?? null,
        multiGyms: Array.isArray(response?.multiGyms)
          ? response.multiGyms.map((item: any) => ({
              _id: item?._id ?? item?.gymId,
              name: item?.name,
              description: item?.description ?? null,
              isActive: item?.isActive ?? true,
            }))
          : [],
        isActive: response?.isActive ?? true,
        createdAt: response?.createdAt,
        updatedAt: response?.updatedAt,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetGymProfileQuery, useUpdateGymProfileMutation } =
  gymProfileApi;
