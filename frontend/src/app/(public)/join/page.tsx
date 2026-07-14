import { CandidatureForm } from "@/features/candidatures/CandidatureForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rejoindre la communauté — Data Afrique Hub" };

export default function JoinPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      {/* En-tête */}
      <div className="text-center mb-10">
        <span className="inline-block bg-brand-blue/10 text-brand-blue text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Candidature
        </span>
        <h1 className="text-3xl font-bold text-brand-navy mb-3">
          Rejoindre la communauté
        </h1>
        <p className="text-gray-500 leading-relaxed max-w-md mx-auto">
          Remplissez ce formulaire pour soumettre votre candidature. Notre équipe
          l&apos;examinera et vous contactera par email.
        </p>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <CandidatureForm />
      </div>

      {/* Note de bas de page */}
      <p className="text-center text-xs text-gray-400 mt-6">
        Déjà membre ?{" "}
        <a href="/login" className="text-brand-blue hover:underline">
          Accédez à votre espace
        </a>
      </p>
    </div>
  );
}
