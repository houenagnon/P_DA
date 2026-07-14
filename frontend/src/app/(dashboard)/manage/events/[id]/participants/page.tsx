"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsService } from "@/services/events.service";
import { formatDateTime } from "@/lib/utils";
import { avatarUrl } from "@/lib/utils";
import { Users, CheckCircle, Circle, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import type { EventParticipant } from "@/types/events.types";

export default function EventParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();

  const { data: event } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventsService.get(id).then((r) => r.data),
  });

  const { data: participants = [], isLoading } = useQuery({
    queryKey: ["event-participants", id],
    queryFn: () => eventsService.participants(id).then((r) => r.data),
  });

  const validatePresence = useMutation({
    mutationFn: (userId: number) => eventsService.validatePresence(id, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event-participants", id] }),
  });

  const list: EventParticipant[] = Array.isArray(participants) ? participants : (participants as { results?: EventParticipant[] }).results ?? [];
  const validated = list.filter((p) => p.presence_validated).length;

  function handleExport() {
    eventsService.export(id).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `participants_${id}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/manage/events" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-blue mb-2 transition-colors">
            <ArrowLeft size={14} /> Retour aux événements
          </Link>
          <h1 className="text-2xl font-bold text-brand-navy">Participants</h1>
          {event && <p className="text-gray-500 text-sm mt-1">{event.title}</p>}
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Download size={15} /> Exporter Excel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Inscrits", value: list.length, color: "text-brand-navy" },
          { label: "Présences validées", value: validated, color: "text-green-600" },
          { label: "En attente", value: list.length - validated, color: "text-brand-orange" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <Users size={16} className="text-brand-blue" />
          <span className="font-medium text-brand-navy text-sm">{list.length} participant{list.length > 1 ? "s" : ""}</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : list.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucun participant inscrit</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {list.map((participant) => {
              const fullName = `${participant.user_first_name} ${participant.user_last_name}`;
              return (
                <div key={participant.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <img
                    src={avatarUrl(fullName, 36)}
                    alt={fullName}
                    className="w-9 h-9 rounded-full shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brand-navy text-sm">{fullName}</p>
                    <p className="text-gray-400 text-xs">{participant.user_email}</p>
                    {participant.motivation && (
                      <p className="text-gray-500 text-xs mt-0.5 line-clamp-1 italic">&ldquo;{participant.motivation}&rdquo;</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400 mb-1.5">{formatDateTime(participant.created_at)}</p>
                    {participant.presence_validated ? (
                      <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                        <CheckCircle size={14} className="fill-green-600 text-white" />
                        Présent
                      </div>
                    ) : (
                      <button
                        onClick={() => validatePresence.mutate(participant.user_id)}
                        disabled={validatePresence.isPending}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-brand-blue text-xs font-medium transition-colors group"
                      >
                        <Circle size={14} className="group-hover:text-brand-blue" />
                        Valider
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
