"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { membershipsService } from "@/services/memberships.service";
import { candidatureSchema, type CandidatureInput } from "@/features/auth/schemas";
import { CheckCircle2 } from "lucide-react";

const STEPS = ["Identité", "Profil & Motivation"] as const;

const inputCls =
  "w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue";

function Field({
  label,
  children,
  error,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-navy mb-1">{label}</label>
      {children}
      {hint && !error && <p className="text-gray-400 text-xs mt-1">{hint}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function CandidatureForm() {
  const [step, setStep] = useState(0);

  const mutation = useMutation({
    mutationFn: (data: CandidatureInput) =>
      membershipsService.submitCandidature(data),
  });

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<CandidatureInput>({ resolver: zodResolver(candidatureSchema) });

  const motivation = watch("motivation") ?? "";

  async function nextStep() {
    const step1Fields: (keyof CandidatureInput)[] = [
      "first_name", "last_name", "email", "phone",
    ];
    const valid = await trigger(step1Fields);
    if (valid) setStep(1);
  }

  if (mutation.isSuccess) {
    return (
      <div className="text-center py-6 space-y-4">
        <CheckCircle2 size={48} className="text-green-500 mx-auto" />
        <h3 className="text-lg font-semibold text-brand-navy">
          Candidature envoyée !
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Merci pour votre intérêt. Notre équipe examinera votre candidature et
          vous contactera par email dans les meilleurs délais.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                i <= step
                  ? "bg-brand-blue text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-xs hidden sm:block ${
                i <= step ? "text-brand-navy font-medium" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Étape 1 — Identité */}
      {step === 0 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prénom *" error={errors.first_name?.message}>
              <input {...register("first_name")} placeholder="Merveille" className={inputCls} />
            </Field>
            <Field label="Nom *" error={errors.last_name?.message}>
              <input {...register("last_name")} placeholder="Houenagnon" className={inputCls} />
            </Field>
          </div>
          <Field label="Adresse email *" error={errors.email?.message}>
            <input type="email" {...register("email")} placeholder="vous@exemple.com" className={inputCls} />
          </Field>
          <Field label="Téléphone" error={errors.phone?.message} hint="Optionnel">
            <input {...register("phone")} placeholder="+229 61 00 00 00" className={inputCls} />
          </Field>
        </>
      )}

      {/* Étape 2 — Profil & Motivation */}
      {step === 1 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Pays *" error={errors.country?.message}>
              <input {...register("country")} placeholder="Bénin" className={inputCls} />
            </Field>
            <Field label="Profession *" error={errors.profession?.message}>
              <input {...register("profession")} placeholder="Data Scientist" className={inputCls} />
            </Field>
          </div>
          <Field label="LinkedIn" error={errors.linkedin_url?.message} hint="Optionnel">
            <input
              {...register("linkedin_url")}
              placeholder="https://linkedin.com/in/..."
              className={inputCls}
            />
          </Field>
          <Field
            label="Pourquoi souhaitez-vous rejoindre DAH ? *"
            error={errors.motivation?.message}
          >
            <textarea
              {...register("motivation")}
              rows={5}
              placeholder="Décrivez votre parcours, vos motivations et ce que vous souhaitez apporter à la communauté..."
              className={`${inputCls} resize-none`}
            />
            <p className={`text-xs mt-1 text-right ${motivation.length < 50 ? "text-gray-400" : "text-green-600"}`}>
              {motivation.length} / 50 min.
            </p>
          </Field>
        </>
      )}

      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          Une erreur est survenue. Vérifiez vos informations et réessayez.
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-1">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(0)}
            className="flex-1 border border-border rounded-lg py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            ← Retour
          </button>
        )}
        {step === 0 ? (
          <button
            type="button"
            onClick={nextStep}
            className="flex-1 bg-brand-blue text-white rounded-lg py-2.5 text-sm font-medium hover:bg-brand-blue/90 transition-colors"
          >
            Suivant →
          </button>
        ) : (
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex-1 bg-brand-blue text-white rounded-lg py-2.5 text-sm font-medium hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
          >
            {mutation.isPending ? "Envoi en cours…" : "Envoyer ma candidature"}
          </button>
        )}
      </div>
    </form>
  );
}
