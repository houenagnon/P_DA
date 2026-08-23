"use client";

import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { avatarUrl, roleLabel } from "@/lib/utils";

export function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <header className="h-[68px] bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>
        <div className="text-sm text-gray-500 hidden sm:block truncate">
          {user && (
            <span>
              <span className="font-medium text-brand-navy">{user.first_name}</span>
              {" "}· {roleLabel(user.role)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <Link
          href="/profile"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <img
            src={user?.avatar ?? avatarUrl(user?.full_name ?? "U", 32)}
            alt={user?.full_name}
            className="w-8 h-8 rounded-full border border-gray-200 object-cover"
          />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-brand-navy leading-tight">{user?.full_name ?? "…"}</p>
            <p className="text-xs text-gray-400 leading-tight">{user?.email}</p>
          </div>
        </Link>
        <button
          onClick={() => logout.mutate()}
          className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
          title="Déconnexion"
          data-testid="logout-btn"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
