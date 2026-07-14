import { api } from "@/lib/axios";
import type { MemberProfileUpdatePayload, MemberExperience, MemberCertification, SocialLink, SocialPlatform, PublicMemberListItem } from "@/types/members.types";
interface PaginatedResponse<T> { count: number; results: T[]; next: string | null; previous: string | null; }

export const membersService = {
  list: (params?: Record<string, string>) =>
    api.get("/members/", { params }),

  publicList: () =>
    api.get<PaginatedResponse<PublicMemberListItem>>("/members/public/"),

  myProfile: () =>
    api.get("/members/me/profile/"),

  updateProfile: (data: MemberProfileUpdatePayload) =>
    api.patch("/members/me/profile/", data),

  publicProfile: (slug: string) =>
    api.get(`/members/public/${slug}/`),

  experiences: {
    list: () => api.get("/members/me/experiences/"),
    create: (data: Omit<MemberExperience, "id">) => api.post("/members/me/experiences/", data),
    update: (id: number, data: Partial<MemberExperience>) => api.patch(`/members/me/experiences/${id}/`, data),
    delete: (id: number) => api.delete(`/members/me/experiences/${id}/`),
  },

  certifications: {
    list: () => api.get("/members/me/certifications/"),
    create: (data: Omit<MemberCertification, "id">) => api.post("/members/me/certifications/", data),
    update: (id: number, data: Partial<MemberCertification>) => api.patch(`/members/me/certifications/${id}/`, data),
    delete: (id: number) => api.delete(`/members/me/certifications/${id}/`),
  },

  socialLinks: {
    list: () => api.get("/members/me/social-links/"),
    create: (data: { platform: SocialPlatform; url: string }) => api.post("/members/me/social-links/", data),
    update: (id: number, data: Partial<SocialLink>) => api.patch(`/members/me/social-links/${id}/`, data),
    delete: (id: number) => api.delete(`/members/me/social-links/${id}/`),
  },
};
