"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { membersService } from "@/services/members.service";
import { usersService } from "@/services/users.service";
import { departmentsService } from "@/services/departments.service";
import { avatarUrl, roleLabel, posteLabel, positionLabel, cn } from "@/lib/utils";
import { Search, Users, ExternalLink, Pencil, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useCurrentUser } from "@/hooks/useAuth";
import { isAdmin, POSTES, type Poste } from "@/types/auth.types";
import Link from "next/link";
import type { MemberListItem } from "@/types/members.types";
import type { Department } from "@/types/departments.types";

const ROLE_VARIANTS: Record<string, "blue" | "orange" | "green" | "gray"> = {
  admin: "orange",
  responsable: "blue",
  membre: "green",
  candidat: "gray",
  visiteur: "gray",
};

const ALL_ROLES = ["admin", "responsable", "membre", "candidat", "visiteur"];

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [editingMember, setEditingMember] = useState<MemberListItem | null>(null);
  const qc = useQueryClient();

  const { data: currentUser } = useCurrentUser();
  const canManageUsers = !!currentUser && isAdmin(currentUser.role);

  const { data, isLoading } = useQuery({
    queryKey: ["members", "list", departmentFilter],
    queryFn: () => membersService.list(departmentFilter ? { department: departmentFilter } : undefined).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });

  const { data: departmentsData } = useQuery({
    queryKey: ["departments", "list"],
    queryFn: () => departmentsService.list().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
  const departments: Department[] = Array.isArray(departmentsData) ? departmentsData : departmentsData?.results ?? [];

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => usersService.delete(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members", "list"] }),
  });

  const all: MemberListItem[] = data?.results ?? data ?? [];

  const filtered = all.filter(m =>
    (!search || `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || m.role === roleFilter)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Membres</h1>
        <p className="text-gray-500 text-sm mt-1">{all.length} profil{all.length > 1 ? "s" : ""} membre</p>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white">
          <option value="">Tous les rôles</option>
          {ALL_ROLES.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
        </select>
        <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white">
          <option value="">Tous les départements</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-32 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Aucun membre trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(member => {
            const isSelf = currentUser?.id === member.user_id;
            return (
              <div
                key={member.id}
                className={cn(
                  "bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow relative",
                  !member.is_active && "opacity-60"
                )}
              >
                {canManageUsers && !isSelf && (
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button
                      onClick={() => setEditingMember(member)}
                      title="Modifier"
                      className="p-1.5 text-gray-300 hover:text-brand-blue rounded-lg hover:bg-brand-blue/5 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Supprimer définitivement le compte de ${member.first_name} ${member.last_name} ?`)) {
                          deleteMutation.mutate(member.user_id);
                        }
                      }}
                      title="Supprimer"
                      className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-4">
                  <img
                    src={member.avatar ?? avatarUrl(`${member.first_name} ${member.last_name}`, 60)}
                    alt={`${member.first_name} ${member.last_name}`}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-navy text-sm truncate">
                      {member.first_name} {member.last_name}
                    </p>
                    {member.member_number && (
                      <p className="text-brand-orange text-xs font-medium">{member.member_number}</p>
                    )}
                    {canManageUsers && (
                      <p className="text-gray-400 text-xs truncate">{member.email}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge variant={ROLE_VARIANTS[member.role] ?? "gray"}>
                        {positionLabel(member)}
                      </Badge>
                      {member.department && (
                        <Badge variant="gray">{member.department.name}</Badge>
                      )}
                      {!member.is_active && <Badge variant="red">Désactivé</Badge>}
                    </div>
                  </div>
                </div>

                {member.skills && member.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {member.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{skill}</span>
                    ))}
                    {member.skills.length > 3 && <span className="text-gray-400 text-xs">+{member.skills.length - 3}</span>}
                  </div>
                )}

                <Link
                  href={`/members/${member.slug}`}
                  className="flex items-center justify-center gap-1 w-full py-2 text-xs text-brand-blue border border-brand-blue/20 rounded-xl hover:bg-brand-blue hover:text-white transition-colors font-medium"
                >
                  Voir le profil <ExternalLink size={12} />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {editingMember && (
        <EditMemberModal
          member={editingMember}
          departments={departments}
          onClose={() => setEditingMember(null)}
          onSaved={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}

function EditMemberModal({
  member,
  departments,
  onClose,
  onSaved,
}: {
  member: MemberListItem;
  departments: Department[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const [firstName, setFirstName] = useState(member.first_name);
  const [lastName, setLastName] = useState(member.last_name);
  const [role, setRole] = useState(member.role);
  const [poste, setPoste] = useState<Poste | "">(member.poste as Poste | "" ?? "");
  const [departmentId, setDepartmentId] = useState<string>(member.department ? String(member.department.id) : "");
  const [isActive, setIsActive] = useState(member.is_active);

  const updateMutation = useMutation({
    mutationFn: () =>
      usersService.update(member.user_id, {
        first_name: firstName,
        last_name: lastName,
        role,
        poste: poste || null,
        department_id: departmentId ? Number(departmentId) : null,
        is_active: isActive,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", "list"] });
      onSaved();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-brand-navy">Modifier {member.first_name} {member.last_name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Prénom</label>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nom</label>
              <input
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Rôle</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white"
            >
              {ALL_ROLES.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Poste dans DAH</label>
            <select
              value={poste}
              onChange={e => setPoste(e.target.value as Poste | "")}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white"
            >
              <option value="">-- (aucun)</option>
              {POSTES.map(p => <option key={p} value={p}>{posteLabel(p)}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Département</label>
            <select
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white"
            >
              <option value="">Aucun</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
            Compte actif
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">
            Annuler
          </button>
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="px-4 py-2 text-sm bg-brand-blue text-white rounded-xl font-medium hover:bg-brand-blue/90 disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
