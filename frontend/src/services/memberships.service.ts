import { api } from "@/lib/axios";
import type {
  CandidaturePayload,
  CandidatureList,
  CandidatureDetail,
  ReviewPayload,
} from "@/types/memberships.types";

export const membershipsService = {
  submitCandidature: (data: CandidaturePayload | FormData) =>
    api.post<{ detail: string }>("/memberships/candidatures/", data, {
      headers: data instanceof FormData ? { "Content-Type": undefined } : undefined,
    }),

  listCandidatures: (params?: { status?: string; search?: string }) =>
    api.get<CandidatureList[]>("/memberships/candidatures/list/", { params }),

  getCandidature: (id: number) =>
    api.get<CandidatureDetail>(`/memberships/candidatures/${id}/`),

  reviewCandidature: (id: number, data: ReviewPayload) =>
    api.post<CandidatureDetail>(`/memberships/candidatures/${id}/review/`, data),

  deleteCandidature: (id: number) => api.delete(`/memberships/candidatures/${id}/`),
};
