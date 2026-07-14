"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { resetPasswordSchema, type ResetPasswordInput } from "./schemas";
import Link from "next/link";

export function ResetPasswordForm({ token }: { token: string }) {
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: ResetPasswordInput) =>
      authService.confirmPasswordReset(token, data.new_password, data.new_password_confirm),
    onSuccess: () => setDone(true),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (done) {
    return (
      <div className="text-center py-4 space-y-3">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-sm font-medium text-brand-navy">Mot de passe réinitialisé !</p>
        <p className="text-sm text-muted-foreground">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
        <Link href="/login" className="inline-block mt-2 px-6 py-2.5 bg-brand-blue text-white rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-colors">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">
          Lien invalide ou expiré. Faites une nouvelle demande de réinitialisation.
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-brand-navy mb-1">Nouveau mot de passe</label>
        <input
          type="password"
          {...register("new_password")}
          placeholder="Minimum 8 caractères"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
        {errors.new_password && <p className="text-red-500 text-xs mt-1">{errors.new_password.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-brand-navy mb-1">Confirmer le mot de passe</label>
        <input
          type="password"
          {...register("new_password_confirm")}
          placeholder="Répétez le mot de passe"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
        {errors.new_password_confirm && <p className="text-red-500 text-xs mt-1">{errors.new_password_confirm.message}</p>}
      </div>
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-brand-blue text-white rounded-lg py-2.5 text-sm font-medium hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
      >
        {mutation.isPending ? "Réinitialisation…" : "Réinitialiser le mot de passe"}
      </button>
    </form>
  );
}
