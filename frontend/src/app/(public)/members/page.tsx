"use client";

import { useQuery } from "@tanstack/react-query";
import { membersService } from "@/services/members.service";
import { avatarUrl, roleLabel } from "@/lib/utils";
import { Users, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { PublicMemberListItem } from "@/types/members.types";

const ROLE_ORDER: Record<string, number> = {
  president: 1, vp1: 2, vp2: 3,
  secretaire_general: 4, secretaire_general_adj: 5,
  tresorier: 6, tresorier_adj: 7,
  responsable_departement: 8, formateur: 9, mentor: 10,
  membre: 11, candidat: 12,
};

export default function MembersPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["members", "public-list"],
    queryFn: () => membersService.publicList().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const members: PublicMemberListItem[] = data?.results ?? [];

  const filtered = members
    .filter((m) => {
      const q = search.toLowerCase();
      return (
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) ||
        m.skills.some((s) => s.toLowerCase().includes(q)) ||
        roleLabel(m.role).toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (ROLE_ORDER[a.role] ?? 99) - (ROLE_ORDER[b.role] ?? 99));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-navy via-[#0a0a2e] to-[#0c1a4a] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-blue/20 border border-brand-blue/30 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-6">
            <Users size={14} />
            Notre communauté
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Les membres <span className="text-brand-orange">DAH</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Des professionnels de la data et de l&apos;IA engagés pour transformer l&apos;Afrique.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, compétence, rôle…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue bg-white"
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 h-48 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucun membre trouvé pour &quot;{search}&quot;</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((member) => (
              <MemberCard key={member.slug} member={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemberCard({ member }: { member: PublicMemberListItem }) {
  const fullName = `${member.first_name} ${member.last_name}`;
  const avatar = member.avatar ?? avatarUrl(fullName, 80);

  return (
    <Link
      href={`/members/${member.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-brand-blue/20 transition-all duration-200 flex flex-col"
    >
      {/* Top: avatar + name */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative shrink-0">
          <img
            src={avatar}
            alt={fullName}
            className="w-14 h-14 rounded-xl object-cover border-2 border-gray-100 group-hover:border-brand-blue/30 transition-colors"
          />
          <div className={`absolute -bottom-1.5 -right-1.5 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow leading-none ${
            roleBadgeColor(member.role)
          }`}>
            {roleShort(member.role)}
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-brand-navy group-hover:text-brand-blue transition-colors leading-tight">{fullName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{roleLabel(member.role)}</p>
          {member.current_job && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {member.current_job.title}
              <span className="text-brand-orange"> @ {member.current_job.company}</span>
            </p>
          )}
        </div>
      </div>

      {/* Skills */}
      {member.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {member.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="px-2 py-0.5 bg-brand-blue/8 text-brand-blue text-[11px] font-medium rounded-full border border-brand-blue/15">
              {skill}
            </span>
          ))}
          {member.skills.length > 4 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[11px] rounded-full">
              +{member.skills.length - 4}
            </span>
          )}
        </div>
      )}

      {/* View link */}
      <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity font-medium">
        Voir le profil →
      </div>
    </Link>
  );
}

function roleBadgeColor(role: string) {
  const map: Record<string, string> = {
    president: "bg-brand-orange",
    vp1: "bg-brand-orange",
    vp2: "bg-brand-orange",
    secretaire_general: "bg-purple-500",
    secretaire_general_adj: "bg-purple-400",
    tresorier: "bg-green-500",
    tresorier_adj: "bg-green-400",
    responsable_departement: "bg-teal-500",
    formateur: "bg-indigo-500",
    mentor: "bg-violet-500",
    membre: "bg-brand-blue",
    candidat: "bg-gray-400",
  };
  return map[role] ?? "bg-gray-400";
}

function roleShort(role: string) {
  const map: Record<string, string> = {
    president: "PDT",
    vp1: "VP", vp2: "VP",
    secretaire_general: "SG",
    secretaire_general_adj: "SGA",
    tresorier: "TRES",
    tresorier_adj: "TRESA",
    responsable_departement: "RD",
    formateur: "FORM",
    mentor: "MNT",
    membre: "MBR",
    candidat: "CAND",
  };
  return map[role] ?? role.toUpperCase().slice(0, 4);
}
