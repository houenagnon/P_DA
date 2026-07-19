import { api } from "@/lib/axios";
import type {
  Department, DepartmentDetail, DepartmentWritePayload, AddMembershipPayload, DepartmentMembership,
} from "@/types/departments.types";

export const departmentsService = {
  list: () => api.get<Department[] | { results: Department[] }>("/departments/"),

  get: (id: number) => api.get<DepartmentDetail>(`/departments/${id}/`),

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
};
