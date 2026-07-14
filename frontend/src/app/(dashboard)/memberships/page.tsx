"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useAuth";
import { membershipsService } from "@/services/memberships.service";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { isAdmin } from "@/types/auth.types";
import {
  Check, X, Clock, FileText, ChevronDown, ChevronUp,
  ExternalLink, Search, CheckCircle2, XCircle, Users, Trash2,
} from "lucide-react";
import Link from "next/link";
import type { CandidatureList, CandidatureStatus } from "@/types/memberships.types";

const STATUS_CONFIG: Record<
  CandidatureStatus,
  { label: string; variant: "blue" | "orange" | "green" | "red" | "gray" }
> = {
  pending: { label: "En attente", variant: "gray" },
  accepted: { label: "Acceptée", variant: "green" },
  rejected: { label: "Rejetée", variant: "red" },
};

export default function CandidaturesPage() {
  const { data: user } = useCurrentUser();
  const qc = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<CandidatureStatus | "">("");
  const [search, setSearch] = useState("");

  const canManage = user && (isAdmin(user.role) || user.role === "president");

  const { data: all = [], isLoading } = useQuery({
    queryKey: ["candidatures"],
    queryFn: () => membershipsService.listCandidatures().then((r) => r.data),
    enabled: !!canManage,
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      action,
      rejection_reason,
    }: {
      id: number;
      action: "accept" | "reject";
      rejection_reason?: string;
    }) => membershipsService.reviewCandidature(id, { action, rejection_reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidatures"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => membershipsService.deleteCandidature(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidatures"] }),
  });

  const pending = all.filter((c) => c.status === "pending");
  const accepted = all.filter((c) => c.status === "accepted");
  const rejected = all.filter((c) => c.status === "rejected");

  const filtered = all.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.profession.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (!canManage) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Accès réservé aux administrateurs et au président.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Candidatures</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100">
            <Clock size={16} className="text-gray-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-navy">{pending.length}</p>
            <p className="text-xs text-gray-500">En attente</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100">
            <CheckCircle2 size={16} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-navy">{accepted.length}</p>
            <p className="text-xs text-gray-500">Acceptées</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100">
            <XCircle size={16} className="text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-navy">{rejected.length}</p>
            <p className="text-xs text-gray-500">Rejetées</p>
          </div>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, email, pays, profession…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              { val: "" as const, lbl: "Toutes", count: all.length },
              { val: "pending" as CandidatureStatus, lbl: "En attente", count: pending.length },
              { val: "accepted" as CandidatureStatus, lbl: "Acceptées", count: accepted.length },
              { val: "rejected" as CandidatureStatus, lbl: "Rejetées", count: rejected.length },
            ] as const
          ).map(({ val, lbl, count }) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                statusFilter === val
                  ? "bg-brand-blue text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {lbl} <span className="opacity-70">({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-5 h-20 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            {search ? "Aucun résultat pour cette recherche" : "Aucune candidature"}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-2 text-xs text-brand-blue hover:underline"
            >
              Effacer la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <CandidatureCard
              key={c.id}
              candidature={c}
              expanded={expandedId === c.id}
              onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
              onAccept={() => reviewMutation.mutate({ id: c.id, action: "accept" })}
              onReject={(reason) =>
                reviewMutation.mutate({ id: c.id, action: "reject", rejection_reason: reason })
              }
              onDelete={() => {
                if (confirm(`Supprimer définitivement la candidature de ${c.first_name} ${c.last_name} ?`)) {
                  deleteMutation.mutate(c.id);
                }
              }}
              isPending={reviewMutation.isPending}
            />
          ))}
          <p className="text-xs text-gray-400 text-center pt-2">
            <Users size={11} className="inline mr-1" />
            {filtered.length} candidature{filtered.length > 1 ? "s" : ""}
            {(statusFilter || search) ? " (filtrée" + (filtered.length > 1 ? "s" : "") + ")" : ""}
          </p>
        </div>
      )}
    </div>
  );
}

function CandidatureCard({
  candidature: c,
  expanded,
  onToggle,
  onAccept,
  onReject,
  onDelete,
  isPending,
}: {
  candidature: CandidatureList;
  expanded: boolean;
  onToggle: () => void;
  onAccept: () => void;
  onReject: (reason: string) => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState("");
  const { label, variant } = STATUS_CONFIG[c.status];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-sm shrink-0">
          {(c.first_name[0] + c.last_name[0]).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-brand-navy text-sm">
            {c.first_name} {c.last_name}
          </p>
          <div className="flex items-center flex-wrap gap-2 mt-0.5">
            <Badge variant={variant}>{label}</Badge>
            <span className="text-xs text-gray-400">{c.email}</span>
            <span className="text-xs text-gray-400">{c.country} · {c.profession}</span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={10} /> {formatDate(c.created_at)}
            </span>
          </div>
        </div>
        <Link
          href={`/memberships/${c.id}`}
          onClick={(e) => e.stopPropagation()}
          title="Voir le dossier complet"
          className="p-1.5 text-gray-300 hover:text-brand-blue transition-colors rounded-lg hover:bg-brand-blue/5"
        >
          <ExternalLink size={14} />
        </Link>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Supprimer la candidature"
          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
        >
          <Trash2 size={14} />
        </button>
        {expanded ? (
          <ChevronUp size={16} className="text-gray-400 shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-gray-400 shrink-0" />
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {c.reviewed_by_name && (
            <p className="text-xs text-gray-400 pt-3">
              {c.status === "accepted" ? "Acceptée" : "Rejetée"} par{" "}
              <span className="text-gray-600">{c.reviewed_by_name}</span>
              {c.reviewed_at && ` le ${formatDate(c.reviewed_at)}`}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            {c.status !== "accepted" && (
              <button
                onClick={onAccept}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-green-600 rounded-xl hover:bg-green-700 font-medium disabled:opacity-50 transition-colors"
              >
                <Check size={14} /> {c.status === "rejected" ? "Revenir sur le refus (accepter)" : "Accepter la candidature"}
              </button>
            )}
            {c.status !== "rejected" && (
              <button
                onClick={() => setShowRejectForm(!showRejectForm)}
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-red-500 rounded-xl hover:bg-red-600 font-medium disabled:opacity-50 transition-colors"
              >
                <X size={14} /> {c.status === "accepted" ? "Revenir sur l'acceptation (rejeter)" : "Rejeter"}
              </button>
            )}
          </div>

          {showRejectForm && (
            <div className="mt-3 space-y-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Motif de refus — obligatoire, sera communiqué au candidat"
                rows={3}
                className="w-full border border-red-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setShowRejectForm(false); setReason(""); }}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => { onReject(reason); setShowRejectForm(false); setReason(""); }}
                  disabled={!reason.trim()}
                  className="px-4 py-1.5 text-xs bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
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
