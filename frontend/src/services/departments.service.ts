import { api } from "@/lib/axios";
import type {
  Department, DepartmentDetail, DepartmentWritePayload, AddMembershipPayload, DepartmentMembership,
  DepartmentAnnouncement, AnnouncementWritePayload,
  DepartmentSession, SessionWritePayload, SessionReportPayload,
  DepartmentTask, TaskWritePayload, TaskStatus, MyDepartment,
} from "@/types/departments.types";
import type { MemberListItem } from "@/types/members.types";

export const departmentsService = {
  list: () => api.get<Department[] | { results: Department[] }>("/departments/"),

  get: (id: number) => api.get<DepartmentDetail>(`/departments/${id}/`),

  searchableMembers: (departmentId: number) =>
    api.get<MemberListItem[]>(`/departments/${departmentId}/searchable-members/`),

  create: (data: DepartmentWritePayload) => api.post<Department>("/departments/", data),

  update: (id: number, data: Partial<DepartmentWritePayload>) =>
    api.patch<Department>(`/departments/${id}/`, data),

  delete: (id: number) => api.delete(`/departments/${id}/`),

  addMember: (departmentId: number, data: AddMembershipPayload) =>
    api.post<DepartmentMembership>(`/departments/${departmentId}/members/`, data),

  endMembership: (departmentId: number, membershipId: number, endDate?: string) =>
    api.post<DepartmentMembership>(
      `/departments/${departmentId}/members/${membershipId}/end/`,
      { end_date: endDate },
    ),

  removeMembership: (departmentId: number, membershipId: number) =>
    api.delete(`/departments/${departmentId}/members/${membershipId}/`),

  announcements: {
    list: (departmentId: number) =>
      api.get<DepartmentAnnouncement[]>(`/departments/${departmentId}/announcements/`),
    create: (departmentId: number, data: AnnouncementWritePayload) =>
      api.post<DepartmentAnnouncement>(`/departments/${departmentId}/announcements/`, data),
  },

  sessions: {
    list: (departmentId: number) =>
      api.get<DepartmentSession[]>(`/departments/${departmentId}/sessions/`),
    create: (departmentId: number, data: SessionWritePayload) =>
      api.post<DepartmentSession>(`/departments/${departmentId}/sessions/`, data),
    submitReport: (departmentId: number, sessionId: number, data: SessionReportPayload) =>
      api.post<DepartmentSession>(`/departments/${departmentId}/sessions/${sessionId}/report/`, data),
    sendReminder: (departmentId: number, sessionId: number) =>
      api.post(`/departments/${departmentId}/sessions/${sessionId}/remind/`),
  },

  tasks: {
    list: (departmentId: number) =>
      api.get<DepartmentTask[]>(`/departments/${departmentId}/tasks/`),
    create: (departmentId: number, data: TaskWritePayload) =>
      api.post<DepartmentTask>(`/departments/${departmentId}/tasks/`, data),
    update: (departmentId: number, taskId: number, data: Partial<TaskWritePayload>) =>
      api.patch<DepartmentTask>(`/departments/${departmentId}/tasks/${taskId}/`, data),
    updateStatus: (departmentId: number, taskId: number, taskStatus: TaskStatus) =>
      api.patch<DepartmentTask>(`/departments/${departmentId}/tasks/${taskId}/`, { status: taskStatus }),
  },

  mine: () => api.get<MyDepartment | null>("/departments/mine/"),
};
