"use client";

import { use, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import Link from "next/link";

export default function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const qc = useQueryClient();

  useEffect(() => {
    authService.verifyEmail(token)
      .then(() => {
        // Le compte peut déjà avoir une session active (autre onglet, ou même onglet
        // avant redirection) : on invalide le cache pour que le dashboard cesse
        // immédiatement d'être flouté, sans attendre l'expiration du staleTime.
        qc.invalidateQueries({ queryKey: ["me"] });
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [token, qc]);

  return (
    <>
      <h2 className="text-xl font-semibold text-brand-navy mb-1">Vérification de l&apos;email</h2>

      {status === "loading" && (
        <div className="text-center py-8">
          <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Vérification en cours…</p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center py-6 space-y-3">
          <div className="text-5xl mb-2">✅</div>
          <p className="text-sm font-medium text-brand-navy">Email vérifié avec succès !</p>
          <p className="text-sm text-muted-foreground">Votre compte est maintenant actif.</p>
          <Link href="/dashboard" className="inline-block mt-3 px-6 py-2.5 bg-brand-blue text-white rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-colors">
            Accéder au tableau de bord
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="text-center py-6 space-y-3">
          <div className="text-5xl mb-2">❌</div>
          <p className="text-sm font-medium text-brand-navy">Lien invalide ou expiré</p>
          <p className="text-sm text-muted-foreground">
            Ce lien de vérification est peut-être déjà utilisé ou a expiré.
            Reconnectez-vous pour en recevoir un nouveau.
          </p>
          <Link href="/login" className="inline-block mt-3 px-6 py-2.5 bg-brand-blue text-white rounded-lg text-sm font-medium hover:bg-brand-blue/90 transition-colors">
            Aller à la connexion
          </Link>
        </div>
      )}
    </>
  );
}
