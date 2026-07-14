import type { Metadata } from "next";
import { DashboardHome } from "@/features/dashboard/DashboardHome";

export const metadata: Metadata = { title: "Tableau de bord" };

export default function DashboardPage() {
  return <DashboardHome />;
}
