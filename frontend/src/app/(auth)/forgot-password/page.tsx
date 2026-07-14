import { ForgotPasswordForm } from "@/features/auth/ForgotPasswordForm";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h2 className="text-xl font-semibold text-brand-navy mb-1">Réinitialiser le mot de passe</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Entrez votre email pour recevoir un lien de réinitialisation
      </p>
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-brand-blue hover:underline">
          ← Retour à la connexion
        </Link>
      </p>
    </>
  );
}
