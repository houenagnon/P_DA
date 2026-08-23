"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsService } from "@/services/projects.service";
import { departmentsService } from "@/services/departments.service";
import { membersService } from "@/services/members.service";
import { useCurrentUser } from "@/hooks/useAuth";
import { isBureau, isAdmin } from "@/types/auth.types";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, GitBranch, CalendarDays, ListChecks, Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { ProjectStatus, ProjectTaskWritePayload } from "@/types/projects.types";
import type { MemberListItem } from "@/types/members.types";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  idea: "Idée", active: "En cours", paused: "Pausé", completed: "Terminé", archived: "Archivé",
};
const STATUS_VARIANT: Record<ProjectStatus, "blue" | "orange" | "green" | "gray"> = {
  idea: "gray", active: "blue", paused: "orange", completed: "green", archived: "gray",
};

interface Assignee { id: number; name: string; }

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const projectId = Number(id);
  const qc = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsService.get(projectId).then((r) => r.data),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["project", projectId, "tasks"],
    queryFn: () => projectsService.tasks.list(projectId).then((r) => r.data),
  });

  // Membres pour le sélecteur d'assignation : ceux du département du projet
  // (accessible à tous, y compris le responsable sans poste bureau) ; à défaut
  // (projet transverse, réservé au bureau/admin) tous les membres.
  const { data: departmentDetail } = useQuery({
    queryKey: ["department", project?.department_id],
    queryFn: () => departmentsService.get(project!.department_id as number).then((r) => r.data),
    enabled: !!project?.department_id,
  });
  const { data: allMembersData } = useQuery({
    queryKey: ["members", "list", "for-project-tasks"],
    queryFn: () => membersService.list().then((r) => r.data),
    enabled: !!project && !project.department_id && (isBureau(currentUser) || isAdmin(currentUser?.role ?? "visiteur")),
  });

  const assignees: Assignee[] = project?.department_id
    ? (() => {
        const list: Assignee[] = (departmentDetail?.memberships ?? [])
          .filter((m) => m.is_current)
          .map((m) => ({ id: m.user_id, name: m.user_full_name }));
        if (departmentDetail?.lead_id && !list.some((a) => a.id === departmentDetail.lead_id)) {
          list.unshift({ id: departmentDetail.lead_id, name: departmentDetail.lead_name ?? "Responsable" });
        }
        if (departmentDetail?.co_lead_id && !list.some((a) => a.id === departmentDetail.co_lead_id)) {
          list.unshift({ id: departmentDetail.co_lead_id, name: departmentDetail.co_lead_name ?? "Adjoint" });
        }
        return list;
      })()
    : (Array.isArray(allMembersData) ? allMembersData : allMembersData?.results ?? []).map((m: MemberListItem) => ({
        id: m.user_id, name: `${m.first_name} ${m.last_name}`,
      }));

  const deleteTask = useMutation({
    mutationFn: (taskId: number) => projectsService.tasks.delete(projectId, taskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project", projectId, "tasks"] }),
  });

  const toggleTask = useMutation({
    mutationFn: ({ taskId, isDone }: { taskId: number; isDone: boolean }) =>
      projectsService.tasks.updateStatus(projectId, taskId, isDone),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["project", projectId, "tasks"] }),
  });

  if (isLoading) {
    return <div className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />;
  }
  if (!project) {
    return <p className="text-gray-500">Projet introuvable.</p>;
  }

  const canManage = !!currentUser && (project.owner_id === currentUser.id || isAdmin(currentUser.role) || isBureau(currentUser));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/projects" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-blue mb-2 transition-colors">
          <ArrowLeft size={14} /> Retour aux projets
        </Link>
        <div className="flex items-start gap-2 mb-2 flex-wrap">
          <Badge variant={STATUS_VARIANT[project.status]}>{project.status_display}</Badge>
          {project.department_name && <Badge variant="gray">{project.department_name}</Badge>}
        </div>
        <h1 className="text-2xl font-bold text-brand-navy">{project.title}</h1>
        <p className="text-gray-500 text-sm mt-2 whitespace-pre-line">{project.description}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-400">
          {project.owner_name && <span>Porté par {project.owner_name}</span>}
          {project.deadline && <span className="flex items-center gap-1"><CalendarDays size={12} /> Échéance : {formatDate(project.deadline)}</span>}
          {project.repository_url && (
            <a href={project.repository_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-blue hover:underline">
              <GitBranch size={12} /> Dépôt du projet
            </a>
          )}
        </div>
      </div>

      {canManage && (
        <TaskForm projectId={projectId} assignees={assignees} onCreated={() => qc.invalidateQueries({ queryKey: ["project", projectId, "tasks"] })} />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <ListChecks size={16} className="text-brand-blue" />
          <span className="font-medium text-brand-navy text-sm">{tasks.length} tâche{tasks.length > 1 ? "s" : ""}</span>
        </div>
        {tasks.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">Aucune tâche pour l&apos;instant</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${t.is_done ? "text-gray-400 line-through" : "text-brand-navy"}`}>{t.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {t.assigned_to_name ?? "Non assignée"} · assignée le {formatDate(t.created_at)}
                    {t.due_date && ` · échéance ${formatDate(t.due_date)}`}
                  </p>
                  {t.description && <p className="text-gray-500 text-xs mt-1">{t.description}</p>}
                </div>
                {(canManage || t.assigned_to === currentUser?.id) && (
                  <label className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                    <input type="checkbox" checked={t.is_done} onChange={(e) => toggleTask.mutate({ taskId: t.id, isDone: e.target.checked })} />
                    Fait
                  </label>
                )}
                {canManage && (
                  <button
                    onClick={() => { if (confirm("Supprimer cette tâche ?")) deleteTask.mutate(t.id); }}
                    title="Supprimer"
                    className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskForm({ projectId, assignees, onCreated }: { projectId: number; assignees: Assignee[]; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [dueDate, setDueDate] = useState("");

  const createTask = useMutation({
    mutationFn: () => {
      const payload: ProjectTaskWritePayload = {
        title,
        description,
        assigned_to: assignedTo ? Number(assignedTo) : null,
        due_date: dueDate || null,
      };
      return projectsService.tasks.create(projectId, payload);
    },
    onSuccess: () => {
      setTitle(""); setDescription(""); setAssignedTo(""); setDueDate("");
      onCreated();
    },
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h2 className="font-medium text-brand-navy text-sm mb-3 flex items-center gap-2"><UserPlus size={16} /> Assigner une tâche</h2>
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
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white">
            <option value="">Non assignée</option>
            {assignees.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Échéance (optionnel)</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
        </div>
      </div>
      {createTask.isError && (
        <p className="text-red-500 text-xs mt-2">Impossible d&apos;assigner cette tâche — vérifiez que la personne fait partie du département.</p>
      )}
      <div className="flex justify-end mt-3">
        <button
          onClick={() => createTask.mutate()}
          disabled={!title || createTask.isPending}
          className="px-5 py-2 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {createTask.isPending ? "Création..." : "Assigner"}
        </button>
      </div>
    </div>
  );
}
