import { LoginForm } from "@/features/auth/LoginForm";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <>
      <h2 className="text-xl font-semibold text-brand-navy mb-1">Espace membre</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Connectez-vous à votre espace Data Afrique Hub
      </p>
      <LoginForm />
      <div className="mt-4 text-center space-y-2">
        <Link href="/forgot-password" className="text-sm text-brand-blue hover:underline block">
          Mot de passe oublié ?
        </Link>
        <p className="text-sm text-muted-foreground">
          Pas encore membre ?{" "}
          <Link href="/join" className="text-brand-blue hover:underline">
            Rejoindre la communauté
          </Link>
        </p>
      </div>
    </>
  );
}
