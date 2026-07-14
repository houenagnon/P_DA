"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, CalendarDays, FileText, Settings, ChevronLeft, ChevronRight, Home, CreditCard } from "lucide-react";
import { useCurrentUser } from "@/hooks/useAuth";
import { isAdmin, isBureau } from "@/types/auth.types";

const allNavItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, roles: "all" },
  { href: "/manage/events", label: "Événements", icon: CalendarDays, roles: "all" },
  { href: "/manage/members", label: "Membres", icon: Users, roles: "bureau" },
  { href: "/memberships", label: "Candidatures", icon: FileText, roles: "admin_president" },
  { href: "/member-card", label: "Ma carte", icon: CreditCard, roles: "all" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = allNavItems.filter(item => {
    if (item.roles === "all") return true;
    if (item.roles === "bureau") return user && (isAdmin(user.role) || isBureau(user.role));
    if (item.roles === "admin_president") return user && (isAdmin(user.role) || user.role === "president");
    return true;
  });

  return (
    <aside className={`${collapsed ? "w-[68px]" : "w-64"} bg-brand-navy text-white flex flex-col shrink-0 transition-all duration-200`}>
      <div className={`flex items-center ${collapsed ? "justify-center p-4" : "gap-3 p-5"} border-b border-white/10 h-[68px]`}>
        <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white font-bold text-xs shrink-0">DAH</div>
        {!collapsed && <div><p className="font-bold text-sm leading-tight">Data Afrique Hub</p><p className="text-white/40 text-xs">Portail</p></div>}
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} title={collapsed ? label : undefined}
              className={`flex items-center gap-3 ${collapsed ? "justify-center px-0 mx-2" : "px-4"} py-2.5 text-sm transition-colors rounded-xl mx-2 mb-1 ${
                active ? "bg-brand-blue text-white font-medium" : "text-white/70 hover:text-white hover:bg-white/5"
              }`}>
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3 space-y-1">
        <Link href="/" title={collapsed ? "Site public" : undefined} className={`flex items-center gap-3 ${collapsed ? "justify-center" : "px-3"} py-2.5 text-sm text-white/60 hover:text-white rounded-xl hover:bg-white/5 transition-colors`}>
          <Home size={16} className="shrink-0" />{!collapsed && "Site public"}
        </Link>
        <Link href="/profile" title={collapsed ? "Mon profil" : undefined} className={`flex items-center gap-3 ${collapsed ? "justify-center" : "px-3"} py-2.5 text-sm text-white/60 hover:text-white rounded-xl hover:bg-white/5 transition-colors`}>
          <Settings size={16} className="shrink-0" />{!collapsed && "Mon profil"}
        </Link>
        <button onClick={() => setCollapsed(c => !c)} className={`flex items-center gap-3 ${collapsed ? "justify-center" : "px-3"} py-2 text-white/40 hover:text-white w-full rounded-xl hover:bg-white/5 transition-colors text-sm`}>
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Réduire</span></>}
        </button>
      </div>
    </aside>
  );
}
