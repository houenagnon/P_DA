import { api } from "@/lib/axios";
import type {
  CandidaturePayload,
  CandidatureList,
  CandidatureDetail,
  ReviewPayload,
} from "@/types/memberships.types";

export const membershipsService = {
  submitCandidature: (data: CandidaturePayload) =>
    api.post<{ detail: string }>("/memberships/candidatures/", data),

  listCandidatures: (params?: { status?: string; search?: string }) =>
    api.get<CandidatureList[]>("/memberships/candidatures/list/", { params }),

  getCandidature: (id: number) =>
    api.get<CandidatureDetail>(`/memberships/candidatures/${id}/`),

  reviewCandidature: (id: number, data: ReviewPayload) =>
    api.post<CandidatureDetail>(`/memberships/candidatures/${id}/review/`, data),
};
