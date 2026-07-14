"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Briefcase, Code2, ExternalLink, Search, Star } from "lucide-react";
import { portfolioService } from "@/services/portfolio.service";
import { avatarUrl } from "@/lib/utils";
import type { PortfolioProject } from "@/types/portfolio.types";

export default function PortfolioPage() {
  const [search, setSearch] = useState("");
  const [activeTech, setActiveTech] = useState("");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => portfolioService.list().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const allTechs = Array.from(new Set(projects.flatMap((p) => p.tech_stack_list))).slice(0, 10);

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(q) ||
      p.member_name.toLowerCase().includes(q) ||
      p.tech_stack_list.some((t) => t.toLowerCase().includes(q));
    const matchTech = !activeTech || p.tech_stack_list.includes(activeTech);
    return matchSearch && matchTech;
  });

  const featured = filtered.filter((p) => p.is_featured);
  const regular = filtered.filter((p) => !p.is_featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-navy via-[#0a0a2e] to-[#0c1a4a] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-blue/20 border border-brand-blue/30 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-6">
            <Briefcase size={14} /> Portfolios
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Projets de la <span className="text-brand-orange">communauté</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Découvrez les réalisations des membres de Data Afrique Hub.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Outils */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Titre, auteur, technologie…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 bg-white"
            />
          </div>
          {allTechs.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={() => setActiveTech("")}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  !activeTech ? "bg-brand-blue text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Tous
              </button>
              {allTechs.map((tech) => (
                <button
                  key={tech}
                  onClick={() => setActiveTech(activeTech === tech ? "" : tech)}
                  className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                    activeTech === tech ? "bg-brand-blue text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
            <p>{search || activeTech ? "Aucun projet trouvé" : "Aucun projet publié pour l'instant"}</p>
            {(search || activeTech) && (
              <button onClick={() => { setSearch(""); setActiveTech(""); }} className="mt-3 text-sm text-brand-blue hover:underline">
                Réinitialiser
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {/* Projets mis en avant */}
            {featured.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Star size={15} className="text-brand-orange fill-brand-orange" />
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Projets mis en avant</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featured.map((p) => <ProjectCard key={p.id} project={p} featured />)}
                </div>
              </section>
            )}

            {/* Tous les projets */}
            {regular.length > 0 && (
              <section>
                {featured.length > 0 && (
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                    Autres projets
                  </h2>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regular.map((p) => <ProjectCard key={p.id} project={p} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project: p, featured = false }: { project: PortfolioProject; featured?: boolean }) {
  const avatar = p.member_avatar ?? avatarUrl(p.member_name, 40);

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden flex flex-col group transition-all duration-200 hover:shadow-md ${
      featured ? "border-brand-orange/30 hover:border-brand-orange/50" : "border-gray-100 hover:border-brand-blue/20"
    }`}>
      {/* Image ou placeholder */}
      <div className="h-40 overflow-hidden relative bg-gradient-to-br from-brand-navy to-brand-blue">
        {p.image ? (
          <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Briefcase size={40} className="text-white/20" />
          </div>
        )}
        {featured && (
          <div className="absolute top-3 right-3 bg-brand-orange text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star size={10} className="fill-white" /> Vedette
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-brand-navy group-hover:text-brand-blue transition-colors leading-tight mb-2">
          {p.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1 mb-3">
          {p.description}
        </p>

        {/* Stack */}
        {p.tech_stack_list.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {p.tech_stack_list.slice(0, 4).map((tech) => (
              <span key={tech} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                {tech}
              </span>
            ))}
            {p.tech_stack_list.length > 4 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-xs rounded-full">
                +{p.tech_stack_list.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Auteur + liens */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <Link
            href={`/portfolio/${p.member_slug}`}
            className="flex items-center gap-2 hover:text-brand-blue transition-colors group/author"
          >
            <img src={avatar} alt={p.member_name} className="w-7 h-7 rounded-full border border-gray-100" />
            <span className="text-xs text-gray-500 group-hover/author:text-brand-blue font-medium">
              {p.member_name}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {p.repo_url && (
              <a href={p.repo_url} target="_blank" rel="noopener noreferrer"
                className="p-1.5 text-gray-400 hover:text-brand-navy rounded-lg hover:bg-gray-50 transition-colors"
                onClick={(e) => e.stopPropagation()} title="Voir le code">
                <Code2 size={14} />
              </a>
            )}
            {p.demo_url && (
              <a href={p.demo_url} target="_blank" rel="noopener noreferrer"
                className="p-1.5 text-gray-400 hover:text-brand-blue rounded-lg hover:bg-blue-50 transition-colors"
                onClick={(e) => e.stopPropagation()} title="Voir la démo">
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
