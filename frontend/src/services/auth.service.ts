import { api } from "@/lib/axios";
import type { LoginPayload, LoginResponse, RegisterPayload, User } from "@/types/auth.types";

export const authService = {
  login: (data: LoginPayload) =>
    api.post<LoginResponse>("/auth/login/", data),

  register: (data: RegisterPayload) =>
    api.post<{ detail: string }>("/auth/register/", data),

  logout: (refresh: string) =>
    api.post("/auth/logout/", { refresh }),

  me: () =>
    api.get<User>("/auth/me/"),

  updateMe: (data: Partial<User>) =>
    api.patch<User>("/auth/me/", data),

  changePassword: (data: { old_password: string; new_password: string; new_password_confirm: string }) =>
    api.post("/auth/password/change/", data),

  requestPasswordReset: (email: string) =>
    api.post("/auth/password/reset/", { email }),

  confirmPasswordReset: (token: string, new_password: string, new_password_confirm: string) =>
    api.post("/auth/password/reset/confirm/", { token, new_password, new_password_confirm }),

  verifyEmail: (token: string) =>
    api.post("/auth/email/verify/", { token }),

  deleteAccount: (password: string) =>
    api.post("/auth/account/delete/", { password }),
};
