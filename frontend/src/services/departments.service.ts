import { api } from "@/lib/axios";
import type { Department, DepartmentDetail } from "@/types/departments.types";

export const departmentsService = {
  list: () => api.get<Department[] | { results: Department[] }>("/departments/"),

  get: (id: number) => api.get<DepartmentDetail>(`/departments/${id}/`),
};
