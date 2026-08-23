import { api } from "@/lib/axios";
import type { Project, ProjectWritePayload, ProjectTask, ProjectTaskWritePayload } from "@/types/projects.types";

interface PaginatedResponse<T> { count: number; results: T[]; next: string | null; previous: string | null; }

export const projectsService = {
  list: () => api.get<Project[] | PaginatedResponse<Project>>("/projects/"),

  get: (id: number | string) => api.get<Project>(`/projects/${id}/`),

  create: (data: ProjectWritePayload) => api.post<Project>("/projects/", data),

  update: (id: number, data: Partial<ProjectWritePayload>) => api.patch<Project>(`/projects/${id}/`, data),

  delete: (id: number) => api.delete(`/projects/${id}/`),

  myTasks: () => api.get<ProjectTask[]>("/projects/my-tasks/"),

  tasks: {
    list: (projectId: number) => api.get<ProjectTask[]>(`/projects/${projectId}/tasks/`),

    create: (projectId: number, data: ProjectTaskWritePayload) =>
      api.post<ProjectTask>(`/projects/${projectId}/tasks/`, data),

    update: (projectId: number, taskId: number, data: Partial<ProjectTaskWritePayload>) =>
      api.patch<ProjectTask>(`/projects/${projectId}/tasks/${taskId}/`, data),

    updateStatus: (projectId: number, taskId: number, isDone: boolean) =>
      api.patch<ProjectTask>(`/projects/${projectId}/tasks/${taskId}/`, { is_done: isDone }),

    delete: (projectId: number, taskId: number) => api.delete(`/projects/${projectId}/tasks/${taskId}/`),
  },
};
