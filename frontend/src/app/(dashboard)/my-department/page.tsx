"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { departmentsService } from "@/services/departments.service";
import { formatDate } from "@/lib/utils";
import { Building2, Settings, FolderKanban } from "lucide-react";

export default function MyDepartmentPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["departments", "mine"],
    queryFn: () => departmentsService.mine().then((r) => r.data),
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

  const { department, since, can_manage } = data;

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
        <div className="flex gap-2 shrink-0">
          {can_manage && (
            <Link
              href={`/manage/departments/${department.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Settings size={15} /> Gérer ce département
            </Link>
          )}
          <Link
            href="/projects"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <FolderKanban size={15} /> Projets
          </Link>
        </div>
      </div>
    </div>
  );
}
