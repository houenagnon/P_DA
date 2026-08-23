"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { departmentsService } from "@/services/departments.service";
import { projectsService } from "@/services/projects.service";
import { useCurrentUser } from "@/hooks/useAuth";
import { isBureau } from "@/types/auth.types";
import { formatDate, avatarUrl } from "@/lib/utils";
import { MemberSearchSelect } from "@/components/MemberSearchSelect";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft, Users, UserPlus, CircleX, Trash2, FolderKanban, Plus, X,
  CalendarDays, GitBranch, ListChecks, Pencil, ChevronDown,
} from "lucide-react";
import type { Project, ProjectStatus, ProjectTask, ProjectTaskStatus, ProjectWritePayload, ProjectTaskWritePayload } from "@/types/projects.types";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "idea", label: "Idée" },
  { value: "active", label: "En cours" },
  { value: "paused", label: "Pausé" },
  { value: "completed", label: "Terminé" },
  { value: "archived", label: "Archivé" },
];
const PROJECT_STATUS_VARIANT: Record<ProjectStatus, "blue" | "orange" | "green" | "gray"> = {
  idea: "gray", active: "blue", paused: "orange", completed: "green", archived: "gray",
};

const TASK_STATUS_OPTIONS: { value: ProjectTaskStatus; label: string }[] = [
  { value: "todo", label: "À faire" },
  { value: "in_progress", label: "En cours" },
  { value: "done", label: "Terminée" },
  { value: "blocked", label: "Bloquée" },
];
const TASK_STATUS_VARIANT: Record<ProjectTaskStatus, "blue" | "green" | "red" | "gray"> = {
  todo: "gray", in_progress: "blue", done: "green", blocked: "red",
};

export default function DepartmentWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const departmentId = Number(id);
  const qc = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const { data: department, isLoading } = useQuery({
    queryKey: ["department", departmentId],
    queryFn: () => departmentsService.get(departmentId).then((r) => r.data),
  });

  const { data: membersData } = useQuery({
    queryKey: ["department", departmentId, "searchable-members"],
    queryFn: () => departmentsService.searchableMembers(departmentId).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
    enabled: !!department?.can_manage,
  });

  const { data: projectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects", "by-department", departmentId],
    queryFn: () => projectsService.list(departmentId).then((r) => r.data),
    enabled: !!department,
  });

  const { data: myTasks } = useQuery({
    queryKey: ["projects", "my-tasks"],
    queryFn: () => projectsService.myTasks().then((r) => r.data),
    enabled: !!department?.is_member && !department?.can_manage,
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

  const deleteProject = useMutation({
    mutationFn: (projectId: number) => projectsService.delete(projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", "by-department", departmentId] });
      setSelectedProjectId(null);
    },
  });

  if (isLoading) {
    return <div className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />;
  }
  if (!department) {
    return <p className="text-gray-500">Département introuvable.</p>;
  }

  const members = membersData ?? [];
  const memberships = department.memberships ?? [];
  const current = memberships.filter((m) => m.is_current);
  const history = memberships.filter((m) => !m.is_current);
  const projects: Project[] = Array.isArray(projectsData) ? projectsData : projectsData?.results ?? [];
  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;

  const viewerMode: "manager" | "membre" | "visiteur" = department.can_manage
    ? "manager"
    : department.is_member
      ? "membre"
      : "visiteur";

  // Membres utilisables comme assignés de tâche : adhérents actuels + lead/co-lead
  // (nommer un lead ne crée pas forcément une adhésion datée).
  const assignees = current.map((m) => ({ id: m.user_id, name: m.user_full_name }));
  if (department.lead_id && !assignees.some((a) => a.id === department.lead_id)) {
    assignees.unshift({ id: department.lead_id, name: department.lead_name ?? "Responsable" });
  }
  if (department.co_lead_id && !assignees.some((a) => a.id === department.co_lead_id)) {
    assignees.unshift({ id: department.co_lead_id, name: department.co_lead_name ?? "Adjoint" });
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/manage/departments" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-blue mb-2 transition-colors">
          <ArrowLeft size={14} /> Retour aux départements
        </Link>
        <h1 className="text-2xl font-bold text-brand-navy">{department.name}</h1>
        {department.description && <p className="text-gray-500 text-sm mt-1">{department.description}</p>}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {viewerMode === "manager" && <Badge variant="orange">Responsable</Badge>}
          {viewerMode === "membre" && <Badge variant="blue">Membre</Badge>}
          <Badge variant="gray">{department.member_count} membre{department.member_count > 1 ? "s" : ""}</Badge>
        </div>
      </div>

      {viewerMode === "manager" && (
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
      )}

      {/* Équipe */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Équipe · {current.length}</h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {current.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">Aucun membre actuellement dans ce département</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {current.map((m) => (
                <div key={m.id} className="flex items-center gap-4 px-5 py-4">
                  <img src={avatarUrl(m.user_full_name, 36)} alt={m.user_full_name} className="w-9 h-9 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brand-navy text-sm">
                      {m.user_full_name}
                      {m.user_id === department.lead_id && <span className="text-brand-orange text-xs font-medium"> · Responsable</span>}
                      {m.user_id === department.co_lead_id && <span className="text-brand-orange text-xs font-medium"> · Adjoint</span>}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Depuis le {formatDate(m.start_date)}
                      {m.end_date && ` · jusqu'au ${formatDate(m.end_date)}`}
                    </p>
                  </div>
                  {viewerMode === "manager" && (
                    <>
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
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {viewerMode === "manager" && history.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Historique · {history.length}</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
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
        </section>
      )}

      {/* Projets */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Projets · {projects.length}</h2>
          {viewerMode === "manager" && (
            <button
              onClick={() => setShowProjectForm(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-brand-blue hover:underline"
            >
              <Plus size={14} /> Nouveau projet
            </button>
          )}
        </div>
        {isLoadingProjects ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-36 animate-pulse" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <FolderKanban size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">Aucun projet pour l&apos;instant</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={`text-left bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow flex flex-col gap-2 ${
                  selectedProjectId === project.id ? "border-brand-blue" : "border-gray-100"
                }`}
              >
                <Badge variant={PROJECT_STATUS_VARIANT[project.status]}>{project.status_display}</Badge>
                <h3 className="font-semibold text-brand-navy text-sm">{project.title}</h3>
                <p className="text-gray-500 text-xs line-clamp-2 flex-1">{project.description}</p>
                <div className="text-xs text-gray-400">
                  {project.owner_name && <span>Porté par {project.owner_name}</span>}
                  {project.deadline && <span>{project.owner_name ? " · " : ""}Échéance : {formatDate(project.deadline)}</span>}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedProject && (
        <ProjectDetailPanel
          project={selectedProject}
          assignees={assignees}
          currentUserId={currentUser?.id}
          isBureauUser={!!currentUser && isBureau(currentUser)}
          viewerMode={viewerMode}
          onClose={() => setSelectedProjectId(null)}
          onEdit={() => setEditingProject(selectedProject)}
          onDelete={() => { if (confirm(`Supprimer définitivement « ${selectedProject.title} » ?`)) deleteProject.mutate(selectedProject.id); }}
        />
      )}

      {viewerMode === "membre" && myTasks && myTasks.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1.5">
            <ListChecks size={13} /> Mes tâches · {myTasks.length}
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {myTasks.map((t) => (
              <MyTaskRow key={t.id} task={t} />
            ))}
          </div>
        </section>
      )}

      {(showProjectForm || editingProject) && (
        <ProjectFormModal
          project={editingProject}
          departmentId={departmentId}
          onClose={() => { setShowProjectForm(false); setEditingProject(null); }}
          onSaved={() => { setShowProjectForm(false); setEditingProject(null); }}
        />
      )}
    </div>
  );
}

function MyTaskRow({ task }: { task: ProjectTask }) {
  const qc = useQueryClient();
  const updateStatus = useMutation({
    mutationFn: (taskStatus: ProjectTaskStatus) => projectsService.tasks.updateStatus(task.project, task.id, taskStatus),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", "my-tasks"] }),
  });

  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-brand-navy text-sm">{task.title}</p>
        <p className="text-gray-400 text-xs mt-0.5">
          {task.project_title}
          {task.due_date && ` · échéance ${formatDate(task.due_date)}`}
        </p>
      </div>
      <select
        value={task.status}
        onChange={(e) => updateStatus.mutate(e.target.value as ProjectTaskStatus)}
        className={`text-xs font-medium rounded-full px-3 py-1.5 border-0 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 shrink-0 ${
          { todo: "bg-gray-100 text-gray-600", in_progress: "bg-blue-50 text-brand-blue", done: "bg-green-50 text-green-600", blocked: "bg-red-50 text-red-500" }[task.status]
        }`}
      >
        {TASK_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function ProjectDetailPanel({
  project, assignees, currentUserId, isBureauUser, viewerMode, onClose, onEdit, onDelete,
}: {
  project: Project;
  assignees: { id: number; name: string }[];
  currentUserId: number | undefined;
  isBureauUser: boolean;
  viewerMode: "manager" | "membre" | "visiteur";
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const qc = useQueryClient();
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState<Set<number>>(new Set());

  const { data: tasks = [] } = useQuery({
    queryKey: ["project", project.id, "tasks"],
    queryFn: () => projectsService.tasks.list(project.id).then((r) => r.data),
  });

  const canManageProject = isBureauUser || project.owner_id === currentUserId;
  const showDescriptions = viewerMode !== "visiteur";

  const invalidateTasks = () => qc.invalidateQueries({ queryKey: ["project", project.id, "tasks"] });

  const deleteTask = useMutation({
    mutationFn: (taskId: number) => projectsService.tasks.delete(project.id, taskId),
    onSuccess: invalidateTasks,
  });

  const updateTaskStatus = useMutation({
    mutationFn: ({ taskId, taskStatus }: { taskId: number; taskStatus: ProjectTaskStatus }) =>
      projectsService.tasks.updateStatus(project.id, taskId, taskStatus),
    onSuccess: invalidateTasks,
  });

  function toggleDesc(taskId: number) {
    setExpandedDesc((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId); else next.add(taskId);
      return next;
    });
  }

  return (
    <section className="bg-white rounded-2xl border border-brand-blue/20 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-brand-navy">{project.title}</h3>
          <p className="text-gray-500 text-xs mt-1">{project.description}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-400">
            {project.deadline && <span className="flex items-center gap-1"><CalendarDays size={11} /> Échéance : {formatDate(project.deadline)}</span>}
            {project.repository_url && (
              <a href={project.repository_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-blue hover:underline">
                <GitBranch size={11} /> Dépôt du projet
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {canManageProject && (
            <>
              <button onClick={onEdit} title="Modifier" className="p-1.5 text-gray-300 hover:text-brand-blue rounded-lg hover:bg-brand-blue/5 transition-colors"><Pencil size={14} /></button>
              <button onClick={onDelete} title="Supprimer" className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
            </>
          )}
          <button onClick={onClose} title="Fermer" className="p-1.5 text-gray-300 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"><X size={16} /></button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm">Aucune tâche pour l&apos;instant</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {tasks.map((t) => {
            const canSetAnyStatus = canManageProject;
            const canSetOwnStatus = t.assigned_to === currentUserId;
            const isExpanded = expandedDesc.has(t.id);
            return (
              <div key={t.id} className="flex items-start gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${t.status === "done" ? "text-gray-400 line-through" : "text-brand-navy"}`}>{t.title}</p>
                  {showDescriptions && t.description && (
                    <div className="mt-1">
                      <p className={`text-gray-500 text-xs ${isExpanded ? "" : "line-clamp-2"}`}>{t.description}</p>
                      <button onClick={() => toggleDesc(t.id)} className="text-brand-blue text-xs font-medium mt-0.5 flex items-center gap-0.5 hover:underline">
                        {isExpanded ? "Réduire" : "Plus de détails"}
                        <ChevronDown size={12} className={isExpanded ? "rotate-180" : ""} />
                      </button>
                    </div>
                  )}
                  <p className="text-gray-400 text-xs mt-1">
                    {t.assigned_to_name ?? "Non assignée"} · assignée le {formatDate(t.created_at)}
                    {t.due_date && ` · échéance ${formatDate(t.due_date)}`}
                  </p>
                </div>
                {canSetAnyStatus || canSetOwnStatus ? (
                  <select
                    value={t.status}
                    onChange={(e) => updateTaskStatus.mutate({ taskId: t.id, taskStatus: e.target.value as ProjectTaskStatus })}
                    className={`text-xs font-medium rounded-full px-3 py-1.5 border-0 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 shrink-0 ${
                      { todo: "bg-gray-100 text-gray-600", in_progress: "bg-blue-50 text-brand-blue", done: "bg-green-50 text-green-600", blocked: "bg-red-50 text-red-500" }[t.status]
                    }`}
                  >
                    {TASK_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <Badge variant={TASK_STATUS_VARIANT[t.status]}>{t.status_display}</Badge>
                )}
                {canManageProject && (
                  <button
                    onClick={() => { if (confirm("Supprimer cette tâche ?")) deleteTask.mutate(t.id); }}
                    title="Supprimer"
                    className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {canManageProject && (
        <div className="p-5 pt-3">
          {!showAssignForm ? (
            <button
              onClick={() => setShowAssignForm(true)}
              className="w-full text-left border border-dashed border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-blue font-medium hover:bg-brand-blue/5 hover:border-brand-blue/40 transition-colors flex items-center gap-2"
            >
              <Plus size={15} /> Assigner une tâche
            </button>
          ) : (
            <AssignTaskForm
              projectId={project.id}
              assignees={assignees}
              onDone={() => { setShowAssignForm(false); invalidateTasks(); }}
              onCancel={() => setShowAssignForm(false)}
            />
          )}
        </div>
      )}
    </section>
  );
}

function AssignTaskForm({
  projectId, assignees, onDone, onCancel,
}: {
  projectId: number;
  assignees: { id: number; name: string }[];
  onDone: () => void;
  onCancel: () => void;
}) {
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
    onSuccess: onDone,
  });

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <input
        placeholder="Titre de la tâche"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
      />
      <div>
        <label className="block text-xs text-gray-500 mb-1">Description (optionnel)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Détails, critères de réussite, liens utiles…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Assignée à</label>
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
        <p className="text-red-500 text-xs">Impossible d&apos;assigner cette tâche — vérifiez que la personne fait partie du département.</p>
      )}
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-white">Annuler</button>
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

function ProjectFormModal({
  project, departmentId, onClose, onSaved,
}: {
  project: Project | null;
  departmentId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "idea");
  const [deadline, setDeadline] = useState(project?.deadline ?? "");
  const [repositoryUrl, setRepositoryUrl] = useState(project?.repository_url ?? "");

  const mutation = useMutation({
    mutationFn: () => {
      const payload: ProjectWritePayload = {
        title, description, status, department: departmentId,
        deadline: deadline || null, repository_url: repositoryUrl,
      };
      return project ? projectsService.update(project.id, payload) : projectsService.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", "by-department", departmentId] });
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
                {PROJECT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Échéance</label>
              <input type="date" value={deadline ?? ""} onChange={(e) => setDeadline(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Lien du dépôt (optionnel)</label>
            <input value={repositoryUrl} onChange={(e) => setRepositoryUrl(e.target.value)} placeholder="https://github.com/..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">Annuler</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!title || !description || mutation.isPending}
            className="px-4 py-2 text-sm bg-brand-blue text-white rounded-xl font-medium hover:bg-brand-blue/90 disabled:opacity-50"
          >
            {mutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
