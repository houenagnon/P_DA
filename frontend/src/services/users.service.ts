import { api } from "@/lib/axios";

export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
}

export interface AdminUserUpdatePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
  is_active?: boolean;
}

export const usersService = {
  update: (id: number, data: AdminUserUpdatePayload) =>
    api.patch<AdminUser>(`/auth/users/${id}/`, data),

  delete: (id: number) => api.delete(`/auth/users/${id}/`),
};
