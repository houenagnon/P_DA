"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@/hooks/useAuth";
import { registerSchema, type RegisterInput } from "./schemas";

const STEPS = ["Identité", "Compte", "Confirmation"] as const;

export function RegisterForm() {
  const [step, setStep] = useState(0);
  const register = useRegister();
  const {
    register: field,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function nextStep() {
    const fields: (keyof RegisterInput)[][] = [
      ["first_name", "last_name", "phone"],
      ["email", "password", "password_confirm"],
    ];
    const valid = await trigger(fields[step]);
    if (valid) setStep((s) => s + 1);
  }

  return (
    <form onSubmit={handleSubmit((data) => register.mutate(data))} className="space-y-4">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-6">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i <= step ? "bg-brand-blue text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i <= step ? "text-brand-navy font-medium" : "text-muted-foreground"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      {/* Étape 1 — Identité */}
      {step === 0 && (
        <>
          <Field label="Prénom" error={errors.first_name?.message}>
            <input {...field("first_name")} placeholder="Merveille" className={inputCls} />
          </Field>
          <Field label="Nom" error={errors.last_name?.message}>
            <input {...field("last_name")} placeholder="Houenagnon" className={inputCls} />
          </Field>
          <Field label="Téléphone (optionnel)" error={errors.phone?.message}>
            <input {...field("phone")} placeholder="+229 61 00 00 00" className={inputCls} />
          </Field>
        </>
      )}

      {/* Étape 2 — Compte */}
      {step === 1 && (
        <>
          <Field label="Adresse email" error={errors.email?.message}>
            <input type="email" {...field("email")} placeholder="vous@exemple.com" className={inputCls} />
          </Field>
          <Field label="Mot de passe" error={errors.password?.message}>
            <input type="password" {...field("password")} placeholder="Minimum 8 caractères" className={inputCls} />
          </Field>
          <Field label="Confirmer le mot de passe" error={errors.password_confirm?.message}>
            <input type="password" {...field("password_confirm")} placeholder="••••••••" className={inputCls} />
          </Field>
        </>
      )}

      {/* Étape 3 — Confirmation */}
      {step === 2 && (
        <div className="text-center py-4">
          <div className="text-4xl mb-3">✉️</div>
          <p className="text-sm text-muted-foreground">
            Cliquez sur <strong>Créer mon compte</strong> pour finaliser votre inscription.
            Un email de vérification vous sera envoyé.
          </p>
        </div>
      )}

      {register.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          Une erreur est survenue. Vérifiez vos informations.
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 border border-border rounded-lg py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Retour
          </button>
        )}
        {step < 2 ? (
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
            disabled={register.isPending}
            className="flex-1 bg-brand-blue text-white rounded-lg py-2.5 text-sm font-medium hover:bg-brand-blue/90 disabled:opacity-50 transition-colors"
          >
            {register.isPending ? "Création…" : "Créer mon compte"}
          </button>
        )}
      </div>
    </form>
  );
}

const inputCls = "w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue";

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-navy mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
