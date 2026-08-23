"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { departmentsService } from "@/services/departments.service";
import { formatDate } from "@/lib/utils";
import { Building2, ListChecks, Settings } from "lucide-react";
import type { TaskStatus } from "@/types/departments.types";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "À faire" },
  { value: "in_progress", label: "En cours" },
  { value: "done", label: "Terminée" },
  { value: "blocked", label: "Bloquée" },
];

const STATUS_BADGE: Record<TaskStatus, string> = {
  todo: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-50 text-brand-blue",
  done: "bg-green-50 text-green-600",
  blocked: "bg-red-50 text-red-500",
};

export default function MyDepartmentPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["departments", "mine"],
    queryFn: () => departmentsService.mine().then((r) => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: TaskStatus }) =>
      departmentsService.tasks.updateStatus(data!.department.id, taskId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments", "mine"] }),
  });

  if (isLoading) {
    return <div className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />;
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">Vous n&apos;appartenez à aucun département actuellement</p>
      </div>
    );
  }

  const { department, since, can_manage, my_tasks } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-brand-navy flex items-center gap-2">
            <Building2 size={22} className="text-brand-blue shrink-0" /> {department.name}
          </h1>
          {department.description && <p className="text-gray-500 text-sm mt-1">{department.description}</p>}
          {since && <p className="text-xs text-gray-400 mt-1">Membre depuis le {formatDate(since)}</p>}
        </div>
        {can_manage && (
          <Link
            href={`/manage/departments/${department.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
          >
            <Settings size={15} /> Gérer ce département
          </Link>
        )}
      </div>

      {/* Mes tâches */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <ListChecks size={16} className="text-brand-blue" />
          <span className="font-medium text-brand-navy text-sm">Mes tâches ({my_tasks.length})</span>
        </div>
        {my_tasks.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">Aucune tâche assignée pour l&apos;instant</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {my_tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-navy text-sm">{t.title}</p>
                  {t.description && <p className="text-gray-500 text-xs mt-0.5">{t.description}</p>}
                  <p className="text-gray-400 text-xs mt-0.5">
                    Assignée le {formatDate(t.created_at)}
                    {t.due_date && ` · échéance ${formatDate(t.due_date)}`}
                  </p>
                </div>
                <select
                  value={t.status}
                  onChange={(e) => updateStatus.mutate({ taskId: t.id, status: e.target.value as TaskStatus })}
                  className={`text-xs font-medium rounded-full px-3 py-1.5 border-0 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 shrink-0 ${STATUS_BADGE[t.status]}`}
                >
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
