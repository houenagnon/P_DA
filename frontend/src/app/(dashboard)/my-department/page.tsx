"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { departmentsService } from "@/services/departments.service";
import { Building2 } from "lucide-react";

export default function MyDepartmentPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["departments", "mine"],
    queryFn: () => departmentsService.mine().then((r) => r.data),
  });

  useEffect(() => {
    if (data?.department) {
      router.replace(`/manage/departments/${data.department.id}`);
    }
  }, [data, router]);

  if (isLoading || data?.department) {
    return <div className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />;
  }

  return (
    <div className="text-center py-16">
      <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
      <p className="text-gray-500 font-medium">Vous n&apos;appartenez à aucun département actuellement</p>
    </div>
  );
}
