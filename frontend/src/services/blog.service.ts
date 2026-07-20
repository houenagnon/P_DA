import { api } from "@/lib/axios";
import type {
  ArticleListItem, ArticleDetail, ArticleAdmin, ArticleWritePayload, ArticleCategory,
} from "@/types/blog.types";

export const blogService = {
  list: () => api.get<ArticleListItem[]>("/blog/"),
  get: (slug: string) => api.get<ArticleDetail>(`/blog/${slug}/`),

  categories: {
    list: () => api.get<ArticleCategory[]>("/blog/manage/categories/"),
  },

  manage: {
    list: () => api.get<ArticleAdmin[] | { results: ArticleAdmin[] }>("/blog/manage/articles/"),
    get: (id: number) => api.get<ArticleAdmin>(`/blog/manage/articles/${id}/`),
    create: (data: ArticleWritePayload | FormData) =>
      api.post<ArticleAdmin>("/blog/manage/articles/", data, {
        headers: data instanceof FormData ? { "Content-Type": undefined } : undefined,
      }),
    update: (id: number, data: Partial<ArticleWritePayload> | FormData) =>
      api.patch<ArticleAdmin>(`/blog/manage/articles/${id}/`, data, {
        headers: data instanceof FormData ? { "Content-Type": undefined } : undefined,
      }),
    delete: (id: number) => api.delete(`/blog/manage/articles/${id}/`),
  },
};
