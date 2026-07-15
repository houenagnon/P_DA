"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useAuth";
import { membershipsService } from "@/services/memberships.service";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { isAdmin } from "@/types/auth.types";
import { ArrowLeft, Check, X, ExternalLink, Trash2, FileText } from "lucide-react";
import Link from "next/link";
import type { CandidatureStatus } from "@/types/memberships.types";
import { useState } from "react";

const STATUS_CONFIG: Record<CandidatureStatus, { label: string; variant: "blue" | "orange" | "green" | "red" | "gray" }> = {
  pending: { label: "En attente", variant: "gray" },
  accepted: { label: "Acceptée", variant: "green" },
  rejected: { label: "Rejetée", variant: "red" },
};

export default function CandidatureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const qc = useQueryClient();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const canManage = user && (isAdmin(user.role) || user.role === "president");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data: candidature, isLoading } = useQuery({
    queryKey: ["candidature", id],
    queryFn: () => membershipsService.getCandidature(Number(id)).then((r) => r.data),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      action,
      rejection_reason,
    }: {
      action: "accept" | "reject";
      rejection_reason?: string;
    }) => membershipsService.reviewCandidature(Number(id), { action, rejection_reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidature", id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => membershipsService.deleteCandidature(Number(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidatures"] });
      router.push("/memberships");
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!candidature) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Candidature introuvable.</p>
        <Link href="/memberships" className="text-brand-blue text-sm mt-2 inline-block">
          ← Retour
        </Link>
      </div>
    );
  }

  const { label, variant } = STATUS_CONFIG[candidature.status];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href="/memberships"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-blue mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Retour aux candidatures
          </Link>
          <h1 className="text-2xl font-bold text-brand-navy">Dossier de candidature</h1>
        </div>
        {canManage && (
          <button
            onClick={() => {
              if (confirm(`Supprimer définitivement la candidature de ${candidature.first_name} ${candidature.last_name} ?`)) {
                deleteMutation.mutate();
              }
            }}
            title="Supprimer la candidature"
            className="p-2 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 shrink-0"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* En-tête */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold shrink-0">
            {(candidature.first_name[0] + candidature.last_name[0]).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-semibold text-brand-navy text-lg">
                  {candidature.first_name} {candidature.last_name}
                </h2>
                <p className="text-gray-500 text-sm">{candidature.email}</p>
              </div>
              <Badge variant={variant}>{label}</Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-gray-400">
              <span>{candidature.country}</span>
              <span>{candidature.profession}</span>
              {candidature.phone && <span>{candidature.phone}</span>}
              <span>Soumis le {formatDate(candidature.created_at)}</span>
              {candidature.reviewed_by_name && (
                <span>
                  Examiné par {candidature.reviewed_by_name}
                  {candidature.reviewed_at && ` le ${formatDate(candidature.reviewed_at)}`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              {candidature.linkedin_url && (
                <a
                  href={candidature.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-blue hover:underline"
                >
                  <ExternalLink size={11} /> LinkedIn
                </a>
              )}
              {candidature.cv && (
                <a
                  href={candidature.cv}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-blue hover:underline"
                >
                  <FileText size={11} /> Voir le CV
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Motivation */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Motivation
        </h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
          {candidature.motivation}
        </p>
      </div>

      {/* Motif de refus */}
      {candidature.status === "rejected" && candidature.rejection_reason && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-2">
            Motif de refus
          </h3>
          <p className="text-red-700 text-sm leading-relaxed">
            {candidature.rejection_reason}
          </p>
        </div>
      )}

      {/* Actions */}
      {canManage && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-brand-navy text-sm">Décision</h3>
          <div className="flex flex-wrap gap-3">
            {candidature.status !== "accepted" && (
              <button
                onClick={() => reviewMutation.mutate({ action: "accept" })}
                disabled={reviewMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Check size={15} /> {candidature.status === "rejected" ? "Revenir sur le refus (accepter)" : "Accepter la candidature"}
              </button>
            )}
            {candidature.status !== "rejected" && (
              <button
                onClick={() => setShowRejectForm(!showRejectForm)}
                disabled={reviewMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                <X size={15} /> {candidature.status === "accepted" ? "Revenir sur l'acceptation (rejeter)" : "Rejeter"}
              </button>
            )}
          </div>
          {showRejectForm && (
            <div className="space-y-3 pt-2">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Motif de refus (obligatoire)"
                rows={3}
                className="w-full border border-red-200 rounded-xl p-3 text-sm focus:outline-none resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    reviewMutation.mutate({ action: "reject", rejection_reason: rejectReason });
                    setShowRejectForm(false);
                  }}
                  disabled={!rejectReason.trim()}
                  className="px-4 py-1.5 text-xs bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50"
                >
                  Confirmer le refus
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
