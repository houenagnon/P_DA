"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentsService } from "@/services/departments.service";
import { formatDateTime } from "@/lib/utils";
import { Megaphone } from "lucide-react";

export function AnnouncementsPanel({ departmentId }: { departmentId: number }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["department", departmentId, "announcements"],
    queryFn: () => departmentsService.announcements.list(departmentId).then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: () => departmentsService.announcements.create(departmentId, { title, content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["department", departmentId, "announcements"] });
      setTitle("");
      setContent("");
    },
  });

  const announcements = data ?? [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-medium text-brand-navy text-sm mb-3 flex items-center gap-2">
          <Megaphone size={16} /> Publier une annonce
        </h2>
        <div className="space-y-3">
          <input
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          />
          <textarea
            placeholder="Contenu"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">Un email sera envoyé à tous les membres actuels du département.</p>
        <div className="flex justify-end mt-3">
          <button
            onClick={() => create.mutate()}
            disabled={!title || !content || create.isPending}
            className="px-5 py-2 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {create.isPending ? "Publication..." : "Publier"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <span className="font-medium text-brand-navy text-sm">{announcements.length} annonce{announcements.length > 1 ? "s" : ""}</span>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : announcements.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">Aucune annonce pour l&apos;instant</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {announcements.map((a) => (
              <div key={a.id} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-brand-navy text-sm">{a.title}</p>
                  <span className="text-xs text-gray-400">{formatDateTime(a.created_at)}</span>
                </div>
                <p className="text-gray-600 text-sm mt-1 whitespace-pre-line">{a.content}</p>
                {a.author_name && <p className="text-xs text-gray-400 mt-2">Par {a.author_name}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
