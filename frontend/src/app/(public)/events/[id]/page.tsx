"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CalendarDays, MapPin, Users, Video, ArrowLeft, Check, ExternalLink, Clock } from "lucide-react";
import { eventsService } from "@/services/events.service";
import { formatDateTime, eventTypeLabel, eventTypeBadgeVariant, timeUntil } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { EventRegistrationForm } from "@/features/events/EventRegistrationForm";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventsService.get(id).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Événement introuvable</p>
          <Link href="/events" className="text-brand-blue text-sm mt-2 inline-block">← Retour aux événements</Link>
        </div>
      </div>
    );
  }

  const now = new Date();
  const isPast = new Date(event.start_date) < now;
  const isRegistrationOpen = event.registration_deadline
    ? new Date(event.registration_deadline) >= now
    : !isPast;
  const displayImage = isPast ? event.recap_image ?? event.cover_image : event.cover_image;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-navy to-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/events" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Tous les événements
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant={eventTypeBadgeVariant(event.event_type)}>{eventTypeLabel(event.event_type)}</Badge>
            {event.is_registered && <Badge variant="green"><Check size={10} className="mr-1" />Inscrit</Badge>}
            {event.is_full && <Badge variant="red">Complet</Badge>}
            {isPast && <Badge variant="gray">Passé</Badge>}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight">{event.title}</h1>
          {!isPast && (
            <div className="inline-flex items-center gap-2 bg-brand-orange/20 border border-brand-orange/30 rounded-full px-4 py-1.5 text-sm text-orange-300">
              <Clock size={14} /> {timeUntil(event.start_date)}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Image */}
        <div className="h-64 sm:h-80 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-brand-navy to-brand-blue relative">
          {displayImage ? (
            <img src={displayImage} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <CalendarDays size={120} className="text-white" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Infos */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="font-semibold text-brand-navy mb-4">Informations</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 text-gray-600">
                  <CalendarDays size={16} className="shrink-0 text-brand-blue mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-800">{formatDateTime(event.start_date)}</p>
                    {event.end_date && <p className="text-gray-500">Fin : {formatDateTime(event.end_date)}</p>}
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin size={16} className="shrink-0 text-brand-orange" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.online_link && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Video size={16} className="shrink-0 text-brand-blue" />
                    <a href={event.online_link} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline flex items-center gap-1">
                      Rejoindre en ligne <ExternalLink size={12} />
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-600">
                  <Users size={16} className="shrink-0 text-gray-400" />
                  <span>{event.participant_count} participant{event.participant_count > 1 ? "s" : ""}{event.max_participants ? ` / ${event.max_participants}` : ""}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="font-semibold text-brand-navy mb-4">
                {isPast ? "Résumé de l'événement" : "À propos de cet événement"}
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{event.description}</p>
            </div>

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="font-semibold text-brand-navy mb-4">Intervenants</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.speakers.map((sp: { id: number; name: string; bio: string }) => (
                    <div key={sp.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {sp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-brand-navy text-sm">{sp.name}</p>
                        <p className="text-gray-500 text-xs leading-relaxed mt-0.5">{sp.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Action inscription */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              {event.is_registered ? (
                <div className="text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check size={24} className="text-green-600" />
                  </div>
                  <p className="font-semibold text-gray-800 mb-1">Vous êtes inscrit !</p>
                  <p className="text-gray-500 text-sm">Vous recevrez un rappel avant l&apos;événement.</p>
                </div>
              ) : event.is_full ? (
                <div className="text-center py-2">
                  <p className="font-semibold text-gray-600">Événement complet</p>
                  <p className="text-gray-400 text-sm mt-1">Plus de places disponibles</p>
                </div>
              ) : isPast ? (
                <div className="text-center py-2">
                  <p className="text-gray-500 text-sm">Cet événement est terminé</p>
                </div>
              ) : !isRegistrationOpen ? (
                <div className="text-center py-2">
                  <p className="font-semibold text-gray-600">Inscriptions terminées</p>
                  <p className="text-gray-400 text-sm mt-1">La date limite d&apos;inscription est dépassée</p>
                </div>
              ) : (
                <EventRegistrationForm eventId={id} />
              )}
              {event.registration_deadline && isRegistrationOpen && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  Clôture : {formatDateTime(event.registration_deadline)}
                </p>
              )}
            </div>

            {/* Organisateur */}
            {event.created_by_name && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Organisateur</p>
                <p className="font-medium text-brand-navy text-sm">{event.created_by_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Data Afrique Hub</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
