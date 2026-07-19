"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentsService } from "@/services/departments.service";
import { formatDateTime } from "@/lib/utils";
import { Megaphone, Pencil, Trash2, X } from "lucide-react";
import type { DepartmentAnnouncement } from "@/types/departments.types";

export function AnnouncementsPanel({ departmentId }: { departmentId: number }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

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

  const remove = useMutation({
    mutationFn: (announcementId: number) => departmentsService.announcements.delete(departmentId, announcementId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["department", departmentId, "announcements"] }),
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
            {announcements.map((a) =>
              editingId === a.id ? (
                <AnnouncementEditForm
                  key={a.id}
                  departmentId={departmentId}
                  announcement={a}
                  onDone={() => setEditingId(null)}
                />
              ) : (
                <div key={a.id} className="px-5 py-4 group">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-brand-navy text-sm">{a.title}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400">{formatDateTime(a.created_at)}</span>
                      <button onClick={() => setEditingId(a.id)} title="Modifier" className="p-1 text-gray-300 hover:text-brand-blue rounded opacity-0 group-hover:opacity-100 transition-opacity"><Pencil size={13} /></button>
                      <button
                        onClick={() => { if (confirm("Supprimer cette annonce ?")) remove.mutate(a.id); }}
                        title="Supprimer"
                        className="p-1 text-gray-300 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mt-1 whitespace-pre-line">{a.content}</p>
                  {a.author_name && <p className="text-xs text-gray-400 mt-2">Par {a.author_name}</p>}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AnnouncementEditForm({
  departmentId,
  announcement,
  onDone,
}: {
  departmentId: number;
  announcement: DepartmentAnnouncement;
  onDone: () => void;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(announcement.title);
  const [content, setContent] = useState(announcement.content);

  const update = useMutation({
    mutationFn: () => departmentsService.announcements.update(departmentId, announcement.id, { title, content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["department", departmentId, "announcements"] });
      onDone();
    },
  });

  return (
    <div className="px-5 py-4 bg-gray-50 space-y-3">
      <div className="flex items-center justify-between">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
        />
        <button onClick={onDone} className="ml-2 text-gray-400 hover:text-gray-600"><X size={16} /></button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
      />
      <div className="flex justify-end">
        <button
          onClick={() => update.mutate()}
          disabled={!title || !content || update.isPending}
          className="px-4 py-1.5 text-xs bg-brand-blue text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {update.isPending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
