import { api } from "./baseApi";
import type {
  Faq,
  CreateFaqDto,
  UpdateFaqDto,
} from "@/src/types/extended-types";

const normalizeFaq = (item: any): Faq => ({
  _id: item?._id,
  question: item?.question ?? "",
  answer: item?.answer ?? "",
  isActive: Boolean(item?.isActive ?? true),
  createdAt: item?.createdAt,
  updatedAt: item?.updatedAt,
});

export const faqsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFaqs: builder.query<Faq[], { active?: boolean } | void>({
      query: (params) => {
        const active =
          params && typeof params === "object" ? params.active : undefined;
        return {
          url: "/faqs",
          params: {
            ...(active !== undefined ? { active: active.toString() } : {}),
          },
        };
      },
      providesTags: ["Faq"],
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response.map(normalizeFaq);
        return [];
      },
    }),

    getFaq: builder.query<Faq, string>({
      query: (id) => `/faqs/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Faq", id }],
      transformResponse: (response: any) => normalizeFaq(response),
    }),

    createFaq: builder.mutation<Faq, CreateFaqDto>({
      query: (data) => ({
        url: "/faqs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Faq"],
      transformResponse: (response: any) => normalizeFaq(response),
    }),

    updateFaq: builder.mutation<Faq, { id: string; data: UpdateFaqDto }>({
      query: ({ id, data }) => ({
        url: `/faqs/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Faq"],
      transformResponse: (response: any) => normalizeFaq(response),
    }),

    toggleFaq: builder.mutation<Faq, string>({
      query: (id) => ({
        url: `/faqs/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: ["Faq"],
      transformResponse: (response: any) => normalizeFaq(response),
    }),

    deleteFaq: builder.mutation<void, string>({
      query: (id) => ({
        url: `/faqs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Faq"],
    }),
  }),
});

export const {
  useGetFaqsQuery,
  useGetFaqQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useToggleFaqMutation,
  useDeleteFaqMutation,
} = faqsApi;
