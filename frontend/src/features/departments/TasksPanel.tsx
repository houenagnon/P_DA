"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentsService } from "@/services/departments.service";
import { formatDate } from "@/lib/utils";
import { MemberSearchSelect } from "@/components/MemberSearchSelect";
import { ListChecks, Trash2 } from "lucide-react";
import type { TaskStatus } from "@/types/departments.types";
import type { MemberListItem } from "@/types/members.types";

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

export function TasksPanel({
  departmentId,
  departmentMembers,
}: {
  departmentId: number;
  departmentMembers: MemberListItem[];
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["department", departmentId, "tasks"],
    queryFn: () => departmentsService.tasks.list(departmentId).then((r) => r.data),
  });

  const createTask = useMutation({
    mutationFn: () =>
      departmentsService.tasks.create(departmentId, {
        title,
        description,
        assigned_to_id: assignedTo,
        due_date: dueDate || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["department", departmentId, "tasks"] });
      setTitle("");
      setDescription("");
      setAssignedTo(null);
      setDueDate("");
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: TaskStatus }) =>
      departmentsService.tasks.updateStatus(departmentId, taskId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["department", departmentId, "tasks"] }),
  });

  const deleteTask = useMutation({
    mutationFn: (taskId: number) => departmentsService.tasks.delete(departmentId, taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["department", departmentId, "tasks"] }),
  });

  const tasks = data ?? [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-medium text-brand-navy text-sm mb-3 flex items-center gap-2">
          <ListChecks size={16} /> Assigner une tâche
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="sm:col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          />
          <textarea
            placeholder="Description (optionnel)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="sm:col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none"
          />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Assigné à</label>
            <MemberSearchSelect members={departmentMembers} value={assignedTo} onChange={setAssignedTo} allowClear={false} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Échéance (optionnel)</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={() => createTask.mutate()}
            disabled={!title || !assignedTo || createTask.isPending}
            className="px-5 py-2 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {createTask.isPending ? "Création..." : "Assigner"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <span className="font-medium text-brand-navy text-sm">{tasks.length} tâche{tasks.length > 1 ? "s" : ""}</span>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : tasks.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">Aucune tâche assignée</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-navy text-sm">{t.title}</p>
                  <p className="text-gray-400 text-xs">
                    {t.assigned_to_name ?? "Non assignée"}
                    {t.due_date && ` · échéance ${formatDate(t.due_date)}`}
                  </p>
                  {t.description && <p className="text-gray-500 text-xs mt-1">{t.description}</p>}
                </div>
                <select
                  value={t.status}
                  onChange={(e) => updateStatus.mutate({ taskId: t.id, status: e.target.value as TaskStatus })}
                  className={`text-xs font-medium rounded-full px-3 py-1.5 border-0 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 shrink-0 ${STATUS_BADGE[t.status]}`}
                >
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <button
                  onClick={() => { if (confirm("Supprimer cette tâche ?")) deleteTask.mutate(t.id); }}
                  title="Supprimer"
                  className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
