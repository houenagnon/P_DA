"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/hooks/useAuth";
import { loginSchema, type LoginInput } from "./schemas";

export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  return (
    <form onSubmit={handleSubmit((data) => login.mutate(data))} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-brand-navy mb-1">
          Adresse email
        </label>
        <input
          type="email"
          {...register("email")}
          placeholder="vous@exemple.com"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-navy mb-1">
          Mot de passe
        </label>
        <input
          type="password"
          {...register("password")}
          placeholder="••••••••"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      {login.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          Email ou mot de passe incorrect.
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || login.isPending}
        className="w-full bg-brand-blue text-white rounded-lg py-2.5 text-sm font-medium hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
      >
        {login.isPending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
