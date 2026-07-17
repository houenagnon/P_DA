"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CalendarDays, MapPin, Users, Search, Filter, Video } from "lucide-react";
import { eventsService } from "@/services/events.service";
import { formatDate, eventTypeLabel, eventTypeBadgeVariant } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { Event, EventType } from "@/types/events.types";

const EVENT_TYPES: { value: EventType | ""; label: string }[] = [
  { value: "", label: "Tous les types" },
  { value: "webinaire", label: "Webinaire" },
  { value: "conference", label: "Conférence" },
  { value: "atelier", label: "Atelier" },
  { value: "hackathon", label: "Hackathon" },
  { value: "meetup", label: "Meetup" },
  { value: "formation", label: "Formation" },
];

function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<EventType | "">("");
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const { data, isLoading } = useQuery({
    queryKey: ["events", "public"],
    queryFn: () => eventsService.list({ is_published: "true" }).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const all: Event[] = data?.results ?? data ?? [];
  const now = new Date();
  const isRegistrationOpen = (e: Event) =>
    e.registration_deadline
      ? new Date(e.registration_deadline) >= now
      : new Date(e.start_date) >= now;

  const filtered = all
    .filter((e) =>
      (tab === "upcoming" ? new Date(e.start_date) >= now : new Date(e.start_date) < now) &&
      (!typeFilter || e.event_type === typeFilter) &&
      (!search || e.title.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) =>
      tab === "upcoming"
        ? new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        : new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-navy py-16 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Nos événements</h1>
          <p className="text-white/60 max-w-xl">
            Conférences, ateliers, webinaires et hackathons pour apprendre, créer et se connecter.
          </p>
        </div>
      </section>

      {/* Filtres */}
      <section className="bg-white border-b border-gray-100 sticky top-[72px] z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un événement..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as EventType | "")}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setTab("upcoming")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === "upcoming" ? "bg-white text-brand-navy shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              À venir
            </button>
            <button
              onClick={() => setTab("past")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === "past" ? "bg-white text-brand-navy shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Passés
            </button>
          </div>
        </div>
      </section>

      {/* Liste */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <EventCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Aucun événement trouvé</p>
              <p className="text-gray-400 text-sm mt-1">Essayez d&apos;autres filtres</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((event) => {
                const eventIsPast = new Date(event.start_date) < now;
                const displayImage = eventIsPast
                  ? event.recap_image ?? event.cover_image
                  : event.cover_image;
                return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 group flex flex-col"
                >
                  <div className="h-44 bg-gradient-to-br from-brand-navy to-brand-blue relative shrink-0">
                    {displayImage ? (
                      <img src={displayImage} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <CalendarDays size={100} className="text-white" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant={eventTypeBadgeVariant(event.event_type)}>
                        {eventTypeLabel(event.event_type)}
                      </Badge>
                    </div>
                    {event.online_link && !event.location && (
                      <div className="absolute bottom-3 right-3">
                        <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Video size={10} /> En ligne
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold text-brand-navy line-clamp-2 mb-3 group-hover:text-brand-blue transition-colors flex-1">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="shrink-0 text-brand-blue" />
                        {formatDate(event.start_date)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="shrink-0 text-brand-orange" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users size={14} className="shrink-0 text-gray-400" />
                        <span>{event.participant_count} inscrit{event.participant_count > 1 ? "s" : ""}</span>
                        {event.max_participants && (
                          <span className="text-gray-400">/ {event.max_participants}</span>
                        )}
                        {event.is_full ? (
                          <Badge variant="red" className="ml-auto">Complet</Badge>
                        ) : (
                          !isRegistrationOpen(event) &&
                          !eventIsPast && (
                            <Badge variant="gray" className="ml-auto">Inscriptions terminées</Badge>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
