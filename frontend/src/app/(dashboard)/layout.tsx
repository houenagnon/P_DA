"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useCurrentUser } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { AlertCircle } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: user, refetch, isFetching } = useCurrentUser();
  const [resendDone, setResendDone] = useState(false);

  const resendMutation = useMutation({
    mutationFn: () => authService.resendVerificationEmail(),
    onSuccess: () => setResendDone(true),
  });

  const isUnverified = !!user && !user.email_verified;

  return (
    <div className="flex h-screen overflow-hidden bg-muted">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6 relative">
          <div className={isUnverified ? "blur-sm pointer-events-none select-none" : undefined}>
            {children}
          </div>

          {isUnverified && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 p-6">
              <div className="bg-white border border-amber-200 rounded-2xl shadow-lg p-6 max-w-sm w-full text-center space-y-3">
                <AlertCircle size={32} className="text-amber-500 mx-auto" />
                <p className="font-semibold text-brand-navy">Vérifiez votre adresse email</p>
                <p className="text-sm text-gray-500">
                  L&apos;accès aux fonctionnalités est bloqué tant que votre email n&apos;est pas vérifié.
                  Consultez votre boîte de réception (et les spams).
                </p>
                {resendDone && (
                  <p className="text-sm text-green-600 font-medium">
                    Email renvoyé, vérifiez votre boîte de réception.
                  </p>
                )}

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
                  >
                    {isFetching ? "Vérification…" : "J'ai vérifié mon email — Actualiser"}
                  </button>
                  {!resendDone && (
                    <button
                      onClick={() => resendMutation.mutate()}
                      disabled={resendMutation.isPending}
                      className="px-4 py-2 border border-gray-200 text-brand-navy rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      {resendMutation.isPending ? "Envoi en cours…" : "Renvoyer l'email de vérification"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
