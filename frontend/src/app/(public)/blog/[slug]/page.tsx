"use client";

import { use, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Tag, BookOpen, Heart, MessageCircle, Trash2 } from "lucide-react";
import { blogService } from "@/services/blog.service";
import { formatDate, formatDateTime, avatarUrl } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useAuth";
import type { User as AuthUser } from "@/types/auth.types";

function extractErrorMessage(error: unknown): string {
  const fallback = "Une erreur est survenue.";
  const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: currentUser } = useCurrentUser();

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => blogService.get(slug).then((r) => r.data),
  });

  if (isLoading) return <ArticleSkeleton />;

  if (isError || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
          <p className="text-gray-500 mb-6">Article introuvable.</p>
          <Link href="/blog" className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            ← Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover */}
      {article.cover_image ? (
        <div className="w-full h-72 sm:h-96 overflow-hidden">
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-brand-navy to-brand-blue" />
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 pb-16">
        {/* Card article */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-10">
            {/* Back + Category */}
            <div className="flex items-center gap-3 mb-6">
              <Link
                href="/blog"
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-blue transition-colors"
              >
                <ArrowLeft size={14} /> Actualités
              </Link>
              {article.category && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="text-sm font-semibold text-brand-blue">{article.category.name}</span>
                </>
              )}
            </div>

            {/* Titre */}
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy leading-tight mb-5">
              {article.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-400 pb-6 border-b border-gray-100 mb-8">
              {article.author_name && (
                <span className="flex items-center gap-1.5">
                  <User size={14} /> {article.author_name}
                </span>
              )}
              {article.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> {formatDate(article.published_at)}
                </span>
              )}
              {article.tags_list.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag size={13} className="text-brand-blue" />
                  {article.tags_list.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-brand-blue/8 text-brand-blue text-xs font-medium rounded-full border border-brand-blue/15">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Extrait */}
            {article.excerpt && (
              <p className="text-lg text-gray-600 leading-relaxed mb-8 font-medium border-l-4 border-brand-orange pl-4">
                {article.excerpt}
              </p>
            )}

            {/* Contenu */}
            <div
              className="prose prose-lg prose-gray max-w-none prose-headings:text-brand-navy prose-a:text-brand-blue prose-strong:text-brand-navy"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Like + compteur commentaires */}
            <div className="flex items-center gap-4 mt-10 pt-6 border-t border-gray-100">
              <LikeButton slug={slug} isLiked={article.is_liked_by_me} likesCount={article.likes_count} isAuthenticated={!!currentUser} />
              <span className="flex items-center gap-1.5 text-sm text-gray-400">
                <MessageCircle size={16} /> {article.comments_count} commentaire{article.comments_count > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Commentaires */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 mt-6">
          <CommentsSection slug={slug} currentUser={currentUser} />
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-brand-blue/30 transition-all"
          >
            <BookOpen size={15} /> Voir tous les articles
          </Link>
        </div>
      </div>
    </div>
  );
}

function LikeButton({
  slug, isLiked, likesCount, isAuthenticated,
}: {
  slug: string;
  isLiked: boolean;
  likesCount: number;
  isAuthenticated: boolean;
}) {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => blogService.likes.toggle(slug).then((r) => r.data),
    onSuccess: (result) => {
      qc.setQueryData(["article", slug], (prev: unknown) => {
        if (!prev || typeof prev !== "object") return prev;
        return { ...prev, is_liked_by_me: result.liked, likes_count: result.likes_count };
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-gray-400">
        <Heart size={16} /> {likesCount} j&apos;aime
      </span>
    );
  }

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border transition-colors ${
        isLiked
          ? "bg-red-50 border-red-200 text-red-500"
          : "bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500"
      }`}
    >
      <Heart size={16} className={isLiked ? "fill-red-500" : ""} /> {likesCount}
    </button>
  );
}

function CommentsSection({
  slug, currentUser,
}: {
  slug: string;
  currentUser: AuthUser | undefined;
}) {
  const qc = useQueryClient();
  const [content, setContent] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["article-comments", slug],
    queryFn: () => blogService.comments.list(slug).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (text: string) => blogService.comments.create(slug, text).then((r) => r.data),
    onSuccess: () => {
      setContent("");
      qc.invalidateQueries({ queryKey: ["article-comments", slug] });
      qc.invalidateQueries({ queryKey: ["article", slug] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: number) => blogService.comments.delete(slug, commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["article-comments", slug] });
      qc.invalidateQueries({ queryKey: ["article", slug] });
    },
  });

  return (
    <div>
      <h2 className="flex items-center gap-2 text-lg font-bold text-brand-navy mb-6">
        <MessageCircle size={19} /> Commentaires
      </h2>

      {currentUser ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (content.trim()) createMutation.mutate(content.trim());
          }}
          className="flex gap-3 mb-8"
        >
          <img
            src={currentUser.avatar ?? avatarUrl(currentUser.full_name, 40)}
            alt={currentUser.full_name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={2}
              placeholder="Ajouter un commentaire…"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 resize-none"
            />
            {createMutation.isError && (
              <p className="text-red-500 text-xs mt-1">{extractErrorMessage(createMutation.error)}</p>
            )}
            <button
              type="submit"
              disabled={createMutation.isPending || !content.trim()}
              className="mt-2 px-4 py-1.5 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? "Envoi…" : "Publier"}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-400 mb-8">
          <Link href="/login" className="text-brand-blue hover:underline">Connectez-vous</Link> pour laisser un commentaire.
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-400">Chargement des commentaires…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400">Aucun commentaire pour l&apos;instant.</p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.author_avatar ?? avatarUrl(comment.author_name ?? "?", 40)}
                alt={comment.author_name ?? ""}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-brand-navy">{comment.author_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{formatDateTime(comment.created_at)}</span>
                    {comment.can_delete && (
                      <button
                        onClick={() => deleteMutation.mutate(comment.id)}
                        disabled={deleteMutation.isPending}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full h-72 bg-gray-200 animate-pulse" />
      <div className="max-w-3xl mx-auto px-4 -mt-8 pb-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 space-y-5 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-10 bg-gray-200 rounded w-4/5" />
          <div className="h-4 bg-gray-100 rounded w-56" />
          <div className="h-px bg-gray-100" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
