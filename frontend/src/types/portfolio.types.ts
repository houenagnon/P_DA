export interface PortfolioProject {
  id: number;
  title: string;
  description: string;
  tech_stack_list: string[];
  demo_url: string;
  repo_url: string;
  image: string | null;
  is_featured: boolean;
  member_slug: string;
  member_name: string;
  member_avatar: string | null;
  created_at: string;
}
