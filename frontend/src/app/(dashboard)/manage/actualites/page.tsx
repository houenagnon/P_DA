"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useAuth";
import { blogService } from "@/services/blog.service";
import { isAdmin, isBureau } from "@/types/auth.types";
import { formatDateTime, toDatetimeLocalValue } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Newspaper, Plus, Edit2, Trash2, X } from "lucide-react";
import type { ArticleAdmin, ArticleWritePayload, ArticleStatus } from "@/types/blog.types";

const emptyForm: ArticleWritePayload = {
  title: "", content: "", excerpt: "", category: null, tags: "", status: "draft", published_at: "",
};

const STATUS_OPTIONS: { value: ArticleStatus; label: string }[] = [
  { value: "draft", label: "Brouillon" },
  { value: "scheduled", label: "Programmé" },
  { value: "published", label: "Publié" },
];

const STATUS_VARIANT: Record<ArticleStatus, "gray" | "orange" | "green"> = {
  draft: "gray",
  scheduled: "orange",
  published: "green",
};

export default function ActualitesManagePage() {
  const { data: user } = useCurrentUser();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleAdmin | null>(null);
  const [form, setForm] = useState<ArticleWritePayload>(emptyForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const canManage = user && (isAdmin(user.role) || isBureau(user.role));

  const { data, isLoading } = useQuery({
    queryKey: ["articles", "manage"],
    queryFn: () => blogService.manage.list().then((r) => r.data),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["article-categories"],
    queryFn: () => blogService.categories.list().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const createArticle = useMutation({
    mutationFn: (data: ArticleWritePayload | FormData) => blogService.manage.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["articles"] }); closeForm(); },
  });

  const updateArticle = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ArticleWritePayload> | FormData }) =>
      blogService.manage.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["articles"] }); closeForm(); },
  });

  const deleteArticle = useMutation({
    mutationFn: (id: number) => blogService.manage.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["articles"] }),
  });

  function closeForm() {
    setShowForm(false);
    setEditingArticle(null);
    setForm(emptyForm);
    setCoverFile(null);
  }

  function openCreateForm() {
    setEditingArticle(null);
    setForm(emptyForm);
    setCoverFile(null);
    setShowForm(true);
  }

  function openEditForm(article: ArticleAdmin) {
    setEditingArticle(article);
    setForm({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      tags: article.tags,
      status: article.status,
      published_at: toDatetimeLocalValue(article.published_at),
      seo_title: article.seo_title,
      seo_description: article.seo_description,
    });
    setCoverFile(null);
    setShowForm(true);
  }

  function handleSubmit() {
    let payload: ArticleWritePayload | FormData = form;
    if (coverFile) {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") formData.append(key, String(value));
      });
      formData.append("cover_image", coverFile);
      payload = formData;
    }
    if (editingArticle) {
      updateArticle.mutate({ id: editingArticle.id, data: payload });
    } else {
      createArticle.mutate(payload);
    }
  }

  const categories = categoriesData ?? [];
  const articles: ArticleAdmin[] = Array.isArray(data) ? data : data?.results ?? [];

  if (!canManage) {
    return <p className="text-gray-500">Accès réservé à l&apos;administration.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Actualités</h1>
          <p className="text-gray-500 text-sm mt-1">{articles.length} article{articles.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={openCreateForm} className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Nouvel article
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-brand-blue/20 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-navy">
              {editingArticle ? `Modifier « ${editingArticle.title} »` : "Nouvel article"}
            </h2>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              placeholder="Titre *"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="sm:col-span-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
            <textarea
              placeholder="Extrait (résumé court, optionnel)"
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              rows={2}
              className="sm:col-span-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none"
            />
            <textarea
              placeholder="Contenu *"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={8}
              className="sm:col-span-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none"
            />
            <div>
              <label className="block text-xs text-gray-500 mb-1">Catégorie</label>
              <select
                value={form.category ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value ? Number(e.target.value) : null }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white"
              >
                <option value="">Aucune</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <input
              placeholder="Tags (séparés par des virgules)"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
            <div>
              <label className="block text-xs text-gray-500 mb-1">Statut</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ArticleStatus }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white"
              >
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date de publication (optionnel)</label>
              <input
                type="datetime-local"
                value={form.published_at ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
              <p className="text-xs text-gray-400 mt-1">Laissé vide : réglé automatiquement à maintenant si publié.</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Image de couverture</label>
              {editingArticle?.cover_image && !coverFile && (
                <img src={editingArticle.cover_image} alt="Couverture actuelle" className="w-full h-32 object-cover rounded-lg mb-2 border border-gray-200" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-brand-blue/10 file:text-brand-blue file:text-sm file:font-medium hover:file:bg-brand-blue/20 border border-gray-200 rounded-xl"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={createArticle.isPending || updateArticle.isPending || !form.title || !form.content}
                className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {createArticle.isPending || updateArticle.isPending
                  ? "Enregistrement..."
                  : editingArticle ? "Enregistrer les modifications" : "Créer l'article"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-20 animate-pulse" />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16">
          <Newspaper size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Aucun article</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div key={article.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center shrink-0 overflow-hidden">
                {article.cover_image ? (
                  <img src={article.cover_image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Newspaper size={18} className="text-brand-navy" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-brand-navy text-sm truncate">{article.title}</p>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <Badge variant={STATUS_VARIANT[article.status]}>{STATUS_OPTIONS.find((o) => o.value === article.status)?.label}</Badge>
                  {article.category_name && <span className="text-xs text-gray-400">{article.category_name}</span>}
                  {article.published_at && <span className="text-xs text-gray-400">{formatDateTime(article.published_at)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => openEditForm(article)} title="Modifier" className="p-2 text-gray-400 hover:text-brand-blue rounded-lg hover:bg-gray-50"><Edit2 size={16} /></button>
                <button
                  onClick={() => { if (confirm(`Supprimer l'article « ${article.title} » ?`)) deleteArticle.mutate(article.id); }}
                  title="Supprimer"
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
