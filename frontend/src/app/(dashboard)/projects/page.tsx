"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsService } from "@/services/projects.service";
import { departmentsService } from "@/services/departments.service";
import { useCurrentUser } from "@/hooks/useAuth";
import { isBureau, isAdmin } from "@/types/auth.types";
import { formatDate } from "@/lib/utils";
import { FolderKanban, Plus, X, GitBranch, CalendarDays, Pencil, Trash2, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Project, ProjectStatus, ProjectWritePayload } from "@/types/projects.types";
import type { Department } from "@/types/departments.types";

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "idea", label: "Idée" },
  { value: "active", label: "En cours" },
  { value: "paused", label: "Pausé" },
  { value: "completed", label: "Terminé" },
  { value: "archived", label: "Archivé" },
];

const STATUS_VARIANT: Record<ProjectStatus, "blue" | "orange" | "green" | "gray"> = {
  idea: "gray",
  active: "blue",
  paused: "orange",
  completed: "green",
  archived: "gray",
};

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const qc = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  const { data, isLoading } = useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => projectsService.list().then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });

  const { data: myTasks } = useQuery({
    queryKey: ["projects", "my-tasks"],
    queryFn: () => projectsService.myTasks().then((r) => r.data),
    enabled: !!currentUser,
  });

  const { data: departmentsData } = useQuery({
    queryKey: ["departments", "list"],
    queryFn: () => departmentsService.list().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
  const departments: Department[] = Array.isArray(departmentsData) ? departmentsData : departmentsData?.results ?? [];
  const manageableDepartments = departments.filter((d) => d.can_manage);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => projectsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", "list"] }),
  });

  const taskStatusMutation = useMutation({
    mutationFn: ({ projectId, taskId, isDone }: { projectId: number; taskId: number; isDone: boolean }) =>
      projectsService.tasks.updateStatus(projectId, taskId, isDone),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", "my-tasks"] }),
  });

  const projects: Project[] = Array.isArray(data) ? data : data?.results ?? [];
  const canManage = (p: Project) => !!currentUser && (p.owner_id === currentUser.id || isAdmin(currentUser.role) || isBureau(currentUser));
  const canCreateProject = !!currentUser && (isBureau(currentUser) || manageableDepartments.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Projets</h1>
          <p className="text-gray-500 text-sm mt-1">{projects.length} projet{projects.length > 1 ? "s" : ""} communautaire{projects.length > 1 ? "s" : ""}</p>
        </div>
        {canCreateProject && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
          >
            <Plus size={16} /> Nouveau projet
          </button>
        )}
      </div>

      {/* Mes tâches */}
      {myTasks && myTasks.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <ListChecks size={16} className="text-brand-blue" />
            <span className="font-medium text-brand-navy text-sm">Mes tâches ({myTasks.filter((t) => !t.is_done).length})</span>
          </div>
          <div className="divide-y divide-gray-50">
            {myTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/projects/${t.project}`} className="font-medium text-brand-navy text-sm hover:text-brand-blue transition-colors">
                    {t.title}
                  </Link>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {t.project_title}
                    {t.due_date && ` · échéance ${formatDate(t.due_date)}`}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                  <input
                    type="checkbox"
                    checked={t.is_done}
                    onChange={(e) => taskStatusMutation.mutate({ projectId: t.project, taskId: t.id, isDone: e.target.checked })}
                  />
                  Fait
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-40 animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Aucun projet pour l&apos;instant</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow relative flex flex-col"
            >
              {canManage(project) && (
                <div className="absolute top-3 right-3 flex gap-1">
                  <button
                    onClick={(e) => { e.preventDefault(); setEditingProject(project); }}
                    title="Modifier"
                    className="p-1.5 text-gray-300 hover:text-brand-blue rounded-lg hover:bg-brand-blue/5 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm(`Supprimer définitivement « ${project.title} » ?`)) deleteMutation.mutate(project.id);
                    }}
                    title="Supprimer"
                    className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              <div className="flex items-start gap-2 mb-2 pr-14 flex-wrap">
                <Badge variant={STATUS_VARIANT[project.status]}>{project.status_display}</Badge>
                {project.department_name && <Badge variant="gray">{project.department_name}</Badge>}
              </div>

              <h2 className="font-semibold text-brand-navy mb-1.5">{project.title}</h2>
              <p className="text-gray-500 text-sm line-clamp-3 flex-1">{project.description}</p>

              <div className="mt-4 pt-3 border-t border-gray-50 space-y-1.5 text-xs text-gray-400">
                {project.owner_name && <p>Porté par {project.owner_name}</p>}
                {project.deadline && (
                  <p className="flex items-center gap-1.5"><CalendarDays size={12} /> Échéance : {formatDate(project.deadline)}</p>
                )}
                {project.repository_url && (
                  <span className="flex items-center gap-1.5 text-brand-blue">
                    <GitBranch size={12} /> Dépôt du projet
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {(showForm || editingProject) && (
        <ProjectFormModal
          project={editingProject}
          departments={departments}
          manageableDepartments={manageableDepartments}
          isBureauUser={!!currentUser && isBureau(currentUser)}
          onClose={() => { setShowForm(false); setEditingProject(null); }}
          onSaved={() => { setShowForm(false); setEditingProject(null); }}
        />
      )}
    </div>
  );
}

function ProjectFormModal({
  project, departments, manageableDepartments, isBureauUser, onClose, onSaved,
}: {
  project: Project | null;
  departments: Department[];
  manageableDepartments: Department[];
  isBureauUser: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "idea");
  const [departmentId, setDepartmentId] = useState<string>(project?.department_id ? String(project.department_id) : "");
  const [deadline, setDeadline] = useState(project?.deadline ?? "");
  const [repositoryUrl, setRepositoryUrl] = useState(project?.repository_url ?? "");

  // En édition, le projet peut déjà être rattaché à un département que l'utilisateur
  // ne gère pas lui-même (ex: bureau a créé un projet, puis un simple propriétaire
  // l'édite) — on garde cette option dans la liste même si elle n'est pas "gérable".
  const departmentOptions = isBureauUser
    ? departments
    : project?.department_id
      ? departments.filter((d) => d.can_manage || d.id === project.department_id)
      : manageableDepartments;

  const mutation = useMutation({
    mutationFn: () => {
      const payload: ProjectWritePayload = {
        title,
        description,
        status,
        department: departmentId ? Number(departmentId) : null,
        deadline: deadline || null,
        repository_url: repositoryUrl,
      };
      return project ? projectsService.update(project.id, payload) : projectsService.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", "list"] });
      onSaved();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-brand-navy">{project ? "Modifier le projet" : "Nouveau projet"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Titre</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Statut</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white">
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Échéance</label>
              <input type="date" value={deadline ?? ""} onChange={(e) => setDeadline(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Département{isBureauUser ? " (optionnel)" : ""}</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white">
              {isBureauUser && <option value="">Aucun (transverse)</option>}
              {departmentOptions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {!isBureauUser && (
              <p className="text-gray-400 text-xs mt-1">Vous ne pouvez créer un projet que pour un département que vous dirigez.</p>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Lien du dépôt (optionnel)</label>
            <input value={repositoryUrl} onChange={(e) => setRepositoryUrl(e.target.value)} placeholder="https://github.com/..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
          </div>
        </div>

        {mutation.isError && (
          <p className="text-red-500 text-xs">Impossible d&apos;enregistrer — vérifiez le département choisi.</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Annuler</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!title || !description || (!isBureauUser && !departmentId) || mutation.isPending}
            className="px-4 py-2 text-sm bg-brand-blue text-white rounded-xl font-medium hover:bg-brand-blue/90 disabled:opacity-50"
          >
            {mutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
