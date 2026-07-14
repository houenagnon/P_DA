export interface ArticleCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ArticleListItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string | null;
  author_name: string | null;
  category: ArticleCategory | null;
  tags_list: string[];
  published_at: string | null;
}

export interface ArticleDetail extends ArticleListItem {
  content: string;
  seo_title: string;
  seo_description: string;
}
