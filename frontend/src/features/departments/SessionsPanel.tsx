"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentsService } from "@/services/departments.service";
import { formatDate } from "@/lib/utils";
import { CalendarClock, Bell, FileEdit } from "lucide-react";
import type { DepartmentSession } from "@/types/departments.types";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function SessionsPanel({
  departmentId,
  departmentMembers,
}: {
  departmentId: number;
  departmentMembers: { user_id: number; name: string }[];
}) {
  const qc = useQueryClient();
  const [date, setDate] = useState(todayIso());
  const [theme, setTheme] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["department", departmentId, "sessions"],
    queryFn: () => departmentsService.sessions.list(departmentId).then((r) => r.data),
  });

  const createSession = useMutation({
    mutationFn: () => departmentsService.sessions.create(departmentId, { date, theme }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["department", departmentId, "sessions"] });
      setTheme("");
    },
  });

  const sendReminder = useMutation({
    mutationFn: (sessionId: number) => departmentsService.sessions.sendReminder(departmentId, sessionId),
  });

  const sessions = data ?? [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-medium text-brand-navy text-sm mb-3 flex items-center gap-2">
          <CalendarClock size={16} /> Planifier une séance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
          </div>
          <input
            placeholder="Thème (optionnel)"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="sm:col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={() => createSession.mutate()}
            disabled={createSession.isPending}
            className="px-5 py-2 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {createSession.isPending ? "Création..." : "Planifier"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <span className="font-medium text-brand-navy text-sm">{sessions.length} séance{sessions.length > 1 ? "s" : ""}</span>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : sessions.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">Aucune séance planifiée</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sessions.map((s) => (
              <div key={s.id} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-brand-navy text-sm">{formatDate(s.date)}{s.theme && ` — ${s.theme}`}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {s.report ? `${s.present_count} présent(s)` : "Rapport non rempli"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => sendReminder.mutate(s.id)}
                      disabled={sendReminder.isPending}
                      title="Envoyer un rappel par email"
                      className="p-1.5 text-gray-300 hover:text-brand-blue rounded-lg hover:bg-brand-blue/5 transition-colors"
                    >
                      <Bell size={14} />
                    </button>
                    <button
                      onClick={() => setEditingSessionId(editingSessionId === s.id ? null : s.id)}
                      title="Remplir le rapport"
                      className="p-1.5 text-gray-300 hover:text-brand-blue rounded-lg hover:bg-brand-blue/5 transition-colors"
                    >
                      <FileEdit size={14} />
                    </button>
                  </div>
                </div>
                {sendReminder.isSuccess && sendReminder.variables === s.id && (
                  <p className="text-green-600 text-xs mt-1">Rappel envoyé.</p>
                )}
                {s.report && editingSessionId !== s.id && (
                  <p className="text-gray-600 text-sm mt-2 whitespace-pre-line">{s.report}</p>
                )}
                {editingSessionId === s.id && (
                  <SessionReportForm
                    departmentId={departmentId}
                    session={s}
                    departmentMembers={departmentMembers}
                    onDone={() => setEditingSessionId(null)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionReportForm({
  departmentId,
  session,
  departmentMembers,
  onDone,
}: {
  departmentId: number;
  session: DepartmentSession;
  departmentMembers: { user_id: number; name: string }[];
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const [report, setReport] = useState(session.report);
  const [present, setPresent] = useState<Set<number>>(new Set(session.present_member_ids));

  const submit = useMutation({
    mutationFn: () =>
      departmentsService.sessions.submitReport(departmentId, session.id, {
        report,
        present_user_ids: Array.from(present),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["department", departmentId, "sessions"] });
      onDone();
    },
  });

  function toggle(userId: number) {
    setPresent((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  return (
    <div className="mt-3 bg-gray-50 rounded-xl p-4 space-y-3">
      <textarea
        placeholder="Compte-rendu de la séance"
        value={report}
        onChange={(e) => setReport(e.target.value)}
        rows={3}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none bg-white"
      />
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Présents</p>
        <div className="flex flex-wrap gap-2">
          {departmentMembers.length === 0 ? (
            <p className="text-xs text-gray-400">Aucun membre actuel dans ce département</p>
          ) : (
            departmentMembers.map((m) => (
              <label key={m.user_id} className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border cursor-pointer transition-colors ${present.has(m.user_id) ? "bg-brand-blue text-white border-brand-blue" : "bg-white text-gray-600 border-gray-200"}`}>
                <input type="checkbox" checked={present.has(m.user_id)} onChange={() => toggle(m.user_id)} className="hidden" />
                {m.name}
              </label>
            ))
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onDone} className="px-4 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-white">Annuler</button>
        <button
          onClick={() => submit.mutate()}
          disabled={submit.isPending}
          className="px-4 py-1.5 text-xs bg-brand-blue text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {submit.isPending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
