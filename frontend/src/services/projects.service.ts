import { api } from "@/lib/axios";
import type { Project, ProjectWritePayload } from "@/types/projects.types";

interface PaginatedResponse<T> { count: number; results: T[]; next: string | null; previous: string | null; }

export const projectsService = {
  list: () => api.get<Project[] | PaginatedResponse<Project>>("/projects/"),

  get: (id: number | string) => api.get<Project>(`/projects/${id}/`),

  create: (data: ProjectWritePayload) => api.post<Project>("/projects/", data),

  update: (id: number, data: Partial<ProjectWritePayload>) => api.patch<Project>(`/projects/${id}/`, data),

  delete: (id: number) => api.delete(`/projects/${id}/`),
};
