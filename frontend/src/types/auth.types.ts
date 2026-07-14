export type Role =
  | "admin" | "president" | "vp1" | "vp2"
  | "secretaire_general" | "secretaire_general_adj"
  | "tresorier" | "tresorier_adj"
  | "responsable_departement" | "formateur" | "mentor"
  | "membre" | "candidat" | "visiteur";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  avatar: string | null;
  role: Role;
  email_verified: boolean;
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  password: string;
  password_confirm: string;
}

export const BUREAU_ROLES: Role[] = [
  "president", "vp1", "vp2",
  "secretaire_general", "secretaire_general_adj",
  "tresorier", "tresorier_adj",
];

export function isBureau(role: Role): boolean {
  return BUREAU_ROLES.includes(role);
}

export function isAdmin(role: Role): boolean {
  return role === "admin";
}
