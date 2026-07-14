import { ResetPasswordForm } from "@/features/auth/ResetPasswordForm";
import Link from "next/link";

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <>
      <h2 className="text-xl font-semibold text-brand-navy mb-1">Nouveau mot de passe</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Choisissez un nouveau mot de passe sécurisé pour votre compte.
      </p>
      <ResetPasswordForm token={token} />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-brand-blue hover:underline">
          ← Retour à la connexion
        </Link>
      </p>
    </>
  );
}
