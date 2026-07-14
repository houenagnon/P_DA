import { api } from "@/lib/axios";
import type { PortfolioProject } from "@/types/portfolio.types";

export const portfolioService = {
  list: () => api.get<PortfolioProject[]>("/portfolios/"),
  byMember: (slug: string) => api.get<PortfolioProject[]>(`/portfolios/${slug}/`),
};
