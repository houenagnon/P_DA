"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { departmentsService } from "@/services/departments.service";
import { formatDate, avatarUrl } from "@/lib/utils";
import { MemberSearchSelect } from "@/components/MemberSearchSelect";
import { AnnouncementsPanel } from "@/features/departments/AnnouncementsPanel";
import { SessionsPanel } from "@/features/departments/SessionsPanel";
import { TasksPanel } from "@/features/departments/TasksPanel";
import { ArrowLeft, Users, UserPlus, CircleX, Trash2 } from "lucide-react";
import type { MemberListItem } from "@/types/members.types";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const TABS = [
  { key: "members", label: "Membres" },
  { key: "announcements", label: "Annonces" },
  { key: "sessions", label: "Séances" },
  { key: "tasks", label: "Tâches" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const departmentId = Number(id);
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabKey>("members");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState("");

  const { data: department, isLoading } = useQuery({
    queryKey: ["department", departmentId],
    queryFn: () => departmentsService.get(departmentId).then((r) => r.data),
  });

  const { data: membersData } = useQuery({
    queryKey: ["department", departmentId, "searchable-members"],
    queryFn: () => departmentsService.searchableMembers(departmentId).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });

  const addMember = useMutation({
    mutationFn: () =>
      departmentsService.addMember(departmentId, {
        user_id: selectedUserId as number,
        start_date: startDate,
        end_date: endDate || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["department", departmentId] });
      setSelectedUserId(null);
      setEndDate("");
    },
  });

  const endMembership = useMutation({
    mutationFn: (membershipId: number) => departmentsService.endMembership(departmentId, membershipId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["department", departmentId] }),
  });

  const removeMembership = useMutation({
    mutationFn: (membershipId: number) => departmentsService.removeMembership(departmentId, membershipId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["department", departmentId] }),
  });

  const members: MemberListItem[] = membersData ?? [];
  const memberships = department?.memberships ?? [];
  const current = memberships.filter((m) => m.is_current);
  const history = memberships.filter((m) => !m.is_current);
  const currentMemberIds = new Set(current.map((m) => m.user_id));
  const departmentMembers = members.filter((m) => currentMemberIds.has(m.user_id));

  if (isLoading) {
    return <div className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />;
  }

  if (!department) {
    return <p className="text-gray-500">Département introuvable.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/manage/departments" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-blue mb-2 transition-colors">
          <ArrowLeft size={14} /> Retour aux départements
        </Link>
        <h1 className="text-2xl font-bold text-brand-navy">{department.name}</h1>
        {department.description && <p className="text-gray-500 text-sm mt-1">{department.description}</p>}
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span>Lead : {department.lead_name ?? "Aucun"}</span>
          <span>Co-lead : {department.co_lead_name ?? "Aucun"}</span>
        </div>
      </div>

      <div className="flex bg-gray-100 rounded-lg p-1 gap-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === t.key ? "bg-white text-brand-navy shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "members" && (
        <div className="space-y-6">
          {/* Ajouter un membre */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-medium text-brand-navy text-sm mb-3 flex items-center gap-2"><UserPlus size={16} /> Ajouter un membre</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <MemberSearchSelect members={members} value={selectedUserId} onChange={setSelectedUserId} allowClear={false} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Depuis le</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Jusqu&apos;au (optionnel)</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
              </div>
            </div>
            {addMember.isError && (
              <p className="text-red-500 text-xs mt-2">
                Impossible d&apos;ajouter ce membre — vérifiez qu&apos;il n&apos;a pas déjà une adhésion en cours ailleurs.
              </p>
            )}
            <div className="flex justify-end mt-3">
              <button
                onClick={() => addMember.mutate()}
                disabled={!selectedUserId || addMember.isPending}
                className="px-5 py-2 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {addMember.isPending ? "Ajout..." : "Ajouter"}
              </button>
            </div>
          </div>

          {/* Membres actuels */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
              <Users size={16} className="text-brand-blue" />
              <span className="font-medium text-brand-navy text-sm">{current.length} membre{current.length > 1 ? "s" : ""} actuel{current.length > 1 ? "s" : ""}</span>
            </div>
            {current.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">Aucun membre actuellement dans ce département</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {current.map((m) => (
                  <div key={m.id} className="flex items-center gap-4 px-5 py-4">
                    <img src={avatarUrl(m.user_full_name, 36)} alt={m.user_full_name} className="w-9 h-9 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brand-navy text-sm">{m.user_full_name}</p>
                      <p className="text-gray-400 text-xs">
                        Depuis le {formatDate(m.start_date)}
                        {m.end_date && ` · jusqu'au ${formatDate(m.end_date)}`}
                      </p>
                    </div>
                    <button
                      onClick={() => endMembership.mutate(m.id)}
                      disabled={endMembership.isPending}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-brand-orange text-xs font-medium transition-colors"
                      title="Terminer l'adhésion aujourd'hui"
                    >
                      <CircleX size={14} /> Terminer
                    </button>
                    <button
                      onClick={() => { if (confirm("Supprimer définitivement cette adhésion ?")) removeMembership.mutate(m.id); }}
                      className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historique */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <span className="font-medium text-brand-navy text-sm">Historique ({history.length})</span>
              </div>
              <div className="divide-y divide-gray-50">
                {history.map((m) => (
                  <div key={m.id} className="flex items-center gap-4 px-5 py-4 opacity-70">
                    <img src={avatarUrl(m.user_full_name, 36)} alt={m.user_full_name} className="w-9 h-9 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brand-navy text-sm">{m.user_full_name}</p>
                      <p className="text-gray-400 text-xs">Du {formatDate(m.start_date)} au {m.end_date ? formatDate(m.end_date) : "?"}</p>
                    </div>
                    <button
                      onClick={() => { if (confirm("Supprimer définitivement cette adhésion ?")) removeMembership.mutate(m.id); }}
                      className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "announcements" && <AnnouncementsPanel departmentId={departmentId} />}

      {tab === "sessions" && (
        <SessionsPanel
          departmentId={departmentId}
          departmentMembers={current.map((m) => ({ user_id: m.user_id, name: m.user_full_name }))}
        />
      )}

      {tab === "tasks" && <TasksPanel departmentId={departmentId} departmentMembers={departmentMembers} />}
    </div>
  );
}
