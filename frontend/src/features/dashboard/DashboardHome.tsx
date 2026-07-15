"use client";

import Link from "next/link";
import { useCurrentUser } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { eventsService } from "@/services/events.service";
import { membersService } from "@/services/members.service";
import { membershipsService } from "@/services/memberships.service";
import { Users, CalendarDays, Award, FileText, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { isAdmin, isBureau } from "@/types/auth.types";
import { formatDate, roleLabel, avatarUrl } from "@/lib/utils";
import type { Event } from "@/types/events.types";
import type { CandidatureList } from "@/types/memberships.types";

export function DashboardHome() {
  const { data: user, isLoading } = useCurrentUser();

  const { data: eventsData } = useQuery({
    queryKey: ["events", "dashboard"],
    queryFn: () => eventsService.list({ is_published: "true" }).then((r) => r.data),
    enabled: !!user,
  });

  const { data: membersData } = useQuery({
    queryKey: ["members", "list"],
    queryFn: () => membersService.list().then((r) => r.data),
    enabled: !!user && (isAdmin(user.role) || isBureau(user.role)),
  });

  const { data: membershipData } = useQuery({
    queryKey: ["candidatures", "pending"],
    queryFn: () => membershipsService.listCandidatures({ status: "pending" }).then((r) => r.data),
    enabled: !!user && (isAdmin(user.role) || user.role === "president"),
  });

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => membersService.myProfile().then((r) => r.data),
    enabled: !!user,
    retry: false,
  });

  if (isLoading) return <DashboardSkeleton />;

  const allEvents: Event[] = eventsData?.results ?? eventsData ?? [];
  const upcomingEvents = allEvents.filter((e) => new Date(e.start_date) > new Date()).slice(0, 4);
  const allMembers = membersData?.results ?? membersData ?? [];
  const pendingCandidatures: CandidatureList[] = membershipData ?? [];

  const isAdminUser = user && isAdmin(user.role);
  const isBureauUser = user && isBureau(user.role);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">
            Bonjour, {user?.first_name} !
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {roleLabel(user?.role ?? "")} · {formatDate(new Date().toISOString())}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar ?? avatarUrl(user?.full_name ?? "U")}
            alt={user?.full_name}
            className="w-10 h-10 rounded-full border-2 border-brand-blue"
          />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/events" className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className="p-2.5 rounded-xl bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-navy">{allEvents.length}</p>
            <p className="text-xs text-gray-500">Événements</p>
          </div>
        </Link>

        {(isAdminUser || isBureauUser) && (
          <Link href="/members" className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className="p-2.5 rounded-xl bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-colors">
              <Users size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-navy">{allMembers.length}</p>
              <p className="text-xs text-gray-500">Membres</p>
            </div>
          </Link>
        )}

        {(isAdminUser || user?.role === "president") && (
          <Link href="/memberships" className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-navy">{pendingCandidatures.length}</p>
              <p className="text-xs text-gray-500">Candidatures en attente</p>
            </div>
          </Link>
        )}

        <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-green-100 text-green-600">
            <Award size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-navy">0</p>
            <p className="text-xs text-gray-500">Certificats</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prochains événements */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-navy">Prochains événements</h2>
            <Link href="/events" className="text-xs text-brand-blue hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">Aucun événement à venir</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center text-white shrink-0">
                    <CalendarDays size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brand-navy text-sm line-clamp-1 group-hover:text-brand-blue transition-colors">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {formatDate(event.start_date)}
                    </p>
                  </div>
                  {event.is_registered && (
                    <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Mon profil / prochaines étapes */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-brand-navy mb-4">Mon profil</h2>

          {myProfile ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={myProfile.user_avatar ?? avatarUrl(user?.full_name ?? "U")}
                  alt={user?.full_name}
                  className="w-12 h-12 rounded-full border-2 border-brand-blue"
                />
                <div>
                  <p className="font-medium text-brand-navy text-sm">{user?.full_name}</p>
                  {myProfile.member_number && (
                    <p className="text-xs text-brand-orange font-medium">{myProfile.member_number}</p>
                  )}
                </div>
              </div>

              {myProfile.skills && myProfile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {myProfile.skills.slice(0, 4).map((skill: string) => (
                    <span key={skill} className="bg-brand-blue/10 text-brand-blue text-xs px-2 py-0.5 rounded-full">
                      {skill}
                    </span>
                  ))}
                  {myProfile.skills.length > 4 && (
                    <span className="text-gray-400 text-xs px-2 py-0.5">+{myProfile.skills.length - 4}</span>
                  )}
                </div>
              )}

              <Link
                href="/profile"
                className="block w-full text-center py-2.5 text-sm font-medium text-brand-blue border border-brand-blue/30 rounded-xl hover:bg-brand-blue hover:text-white transition-colors"
              >
                Voir mon profil
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Complétez votre profil pour être visible par la communauté.</p>
              <Link
                href="/profile"
                className="block w-full text-center py-2.5 text-sm font-medium bg-brand-blue text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Créer mon profil
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-56" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-20" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 h-64" />
        <div className="bg-white rounded-xl border border-gray-100 p-6 h-64" />
      </div>
    </div>
  );
}
