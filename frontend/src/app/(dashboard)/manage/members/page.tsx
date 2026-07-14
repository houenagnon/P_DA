"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { membersService } from "@/services/members.service";
import { avatarUrl, roleLabel } from "@/lib/utils";
import { Search, Users, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import type { MemberListItem } from "@/types/members.types";

const ROLE_VARIANTS: Record<string, "blue" | "orange" | "green" | "gray"> = {
  admin: "orange",
  president: "orange",
  vp1: "orange",
  vp2: "orange",
  secretaire_general: "orange",
  tresorier: "orange",
  formateur: "blue",
  mentor: "blue",
  membre: "green",
  candidat: "gray",
};

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["members", "list"],
    queryFn: () => membersService.list().then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });

  const all: MemberListItem[] = data?.results ?? data ?? [];

  const filtered = all.filter(m =>
    (!search || `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || m.role === roleFilter)
  );

  const uniqueRoles = [...new Set(all.map(m => m.role))].sort();

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
          {uniqueRoles.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
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
          {filtered.map(member => (
            <div key={member.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
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
                  <Badge variant={ROLE_VARIANTS[member.role] ?? "gray"} className="mt-1">
                    {roleLabel(member.role)}
                  </Badge>
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
          ))}
        </div>
      )}
    </div>
  );
}
