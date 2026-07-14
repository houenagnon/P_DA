import { api } from "@/lib/axios";
import type { ArticleListItem, ArticleDetail } from "@/types/blog.types";

export const blogService = {
  list: () => api.get<ArticleListItem[]>("/blog/"),
  get: (slug: string) => api.get<ArticleDetail>(`/blog/${slug}/`),
};
