import { CandidatureForm } from "@/features/candidatures/CandidatureForm";
import type { Metadata } from "next";
import { Users, Handshake, Sparkles } from "lucide-react";

export const metadata: Metadata = { title: "Rejoindre la communauté — Data Afrique Hub" };

const reasons = [
  { icon: Users, text: "Un réseau panafricain de data scientists, ingénieurs et mentors" },
  { icon: Sparkles, text: "Formations, hackathons et projets communautaires" },
  { icon: Handshake, text: "Opportunités professionnelles et partenariats" },
];

export default function JoinPage() {
  return (
    <div className="min-h-[calc(100vh-72px)] flex flex-col lg:flex-row">
      {/* Panneau visuel */}
      <div className="lg:w-[45%] relative overflow-hidden bg-brand-navy flex flex-col justify-between p-10 sm:p-12 min-h-[280px]">
        <img
          src="/images/partner-banner.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/90 via-brand-navy/75 to-brand-blue/60" />

        <div className="relative z-10">
          <span className="inline-block bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-6">
            Candidature
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
            Construisez l&apos;avenir data<br />de l&apos;Afrique avec nous
          </h1>
          <p className="text-white/70 leading-relaxed max-w-sm">
            Remplissez ce formulaire pour soumettre votre candidature. Notre équipe
            l&apos;examinera et vous contactera par email.
          </p>
        </div>

        <ul className="relative z-10 space-y-4 mt-10">
          {reasons.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-white/80 text-sm">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Icon size={16} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* Formulaire */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <CandidatureForm />
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            Déjà membre ?{" "}
            <a href="/login" className="text-brand-blue hover:underline">
              Accédez à votre espace
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
