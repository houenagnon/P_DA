import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const registerSchema = z
  .object({
    first_name: z.string().min(2, "Prénom requis (min 2 caractères)"),
    last_name: z.string().min(2, "Nom requis (min 2 caractères)"),
    email: z.string().email("Email invalide"),
    phone: z.string().optional(),
    password: z.string().min(8, "Minimum 8 caractères"),
    password_confirm: z.string().min(1, "Confirmez le mot de passe"),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirm"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const resetPasswordSchema = z
  .object({
    new_password: z.string().min(8, "Minimum 8 caractères"),
    new_password_confirm: z.string().min(1, "Confirmez le mot de passe"),
  })
  .refine((d) => d.new_password === d.new_password_confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["new_password_confirm"],
  });

export const candidatureSchema = z.object({
  first_name: z.string().min(2, "Prénom requis (min. 2 caractères)"),
  last_name: z.string().min(2, "Nom requis (min. 2 caractères)"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  country: z.string().min(2, "Pays requis"),
  profession: z.string().min(2, "Profession requise"),
  linkedin_url: z
    .string()
    .url("URL LinkedIn invalide")
    .optional()
    .or(z.literal("")),
  motivation: z
    .string()
    .min(50, "Décrivez votre motivation (minimum 50 caractères)"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CandidatureInput = z.infer<typeof candidatureSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
