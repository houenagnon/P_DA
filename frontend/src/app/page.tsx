"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { eventsService } from "@/services/events.service";
import { membersService } from "@/services/members.service";
import { formatDate, eventTypeLabel, avatarUrl, roleLabel } from "@/lib/utils";
import { CalendarDays, MapPin, ArrowRight, Users, Globe, BookOpen, Lightbulb, Handshake, FlaskConical, Star, ChevronRight } from "lucide-react";
import type { Event } from "@/types/events.types";
import type { PublicMemberListItem } from "@/types/members.types";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const step = target / (2000 / 16);
        let current = 0;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <div ref={ref}>{count}{suffix}</div>;
}

const testimonials = [
  { name: "Alice Mensah", role: "Data Scientist @ AfricaAnalytics", avatar: "https://ui-avatars.com/api/?name=Alice+Mensah&background=0972E1&color=fff&bold=true&format=svg", text: "DAH a transformé ma carrière. Les formations, le mentoring et le réseau m'ont permis de décrocher mon poste actuel. C'est bien plus qu'une communauté — c'est une famille." },
  { name: "Robert Ouedraogo", role: "Data Engineer @ OrangeMoney", avatar: "https://ui-avatars.com/api/?name=Robert+Ouedraogo&background=FF8A00&color=fff&bold=true&format=svg", text: "Grâce à DAH, j'ai rencontré des experts extraordinaires et participé à des hackathons qui m'ont appris autant qu'une année de formation classique." },
  { name: "Claire Gbénou", role: "MLOps Engineer & Formatrice", avatar: "https://ui-avatars.com/api/?name=Claire+Gbenou&background=04041A&color=fff&bold=true&format=svg", text: "En tant que formatrice, DAH me donne la plateforme parfaite pour partager mes connaissances et contribuer à l'écosystème data africain." },
];

const activities = [
  { icon: BookOpen, title: "Apprentissage", desc: "Formations pratiques en Data Science, ML, IA et outils cloud pour tous les niveaux." },
  { icon: Lightbulb, title: "Innovation", desc: "Hackathons et projets communautaires pour résoudre des problèmes africains par la data." },
  { icon: Handshake, title: "Collaboration", desc: "Networking, mentoring et opportunités professionnelles au sein d'un réseau panafricain." },
  { icon: FlaskConical, title: "Recherche", desc: "Publications, conférences et articles sur l'impact de la data en Afrique." },
];

const ROLE_ORDER: Record<string, number> = {
  president: 1, vp1: 2, vp2: 3,
  secretaire_general: 4, secretaire_general_adj: 5,
  tresorier: 6, tresorier_adj: 7,
  responsable_departement: 8, formateur: 9, mentor: 10,
  membre: 11, candidat: 12,
};

function roleBadgeColor(role: string) {
  const map: Record<string, string> = {
    president: "bg-brand-orange", vp1: "bg-brand-orange", vp2: "bg-brand-orange",
    secretaire_general: "bg-purple-500", tresorier: "bg-green-500",
    formateur: "bg-indigo-500", mentor: "bg-violet-500",
    membre: "bg-brand-blue", candidat: "bg-gray-400",
  };
  return map[role] ?? "bg-gray-400";
}

export default function LandingPage() {
  const { data: eventsData } = useQuery({
    queryKey: ["events", "public"],
    queryFn: () => eventsService.list({ is_published: "true" }).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
  const { data: membersData } = useQuery({
    queryKey: ["members", "public-list"],
    queryFn: () => membersService.publicList().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });
  const all: Event[] = eventsData?.results ?? eventsData ?? [];
  const upcomingEvents = all.filter((e) => new Date(e.start_date) > new Date()).slice(0, 3);
  const featuredMembers: PublicMemberListItem[] = (membersData?.results ?? [])
    .sort((a: PublicMemberListItem, b: PublicMemberListItem) => (ROLE_ORDER[a.role] ?? 99) - (ROLE_ORDER[b.role] ?? 99))
    .slice(0, 6);

  return (
    <>
      <PublicHeader />
      <main className="pt-[72px]">
        {/* HERO */}
        <section className="relative min-h-[90vh] flex items-center justify-center text-white overflow-hidden" style={{ background: "linear-gradient(135deg, #04041A 0%, #0A1128 50%, #051A4A 100%)" }}>
          <img
            src="/images/innovation-img.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(4,4,26,0.92) 0%, rgba(10,17,40,0.88) 50%, rgba(5,26,74,0.88) 100%)" }} />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 25% 50%, #0972E1 0%, transparent 50%), radial-gradient(circle at 75% 20%, #FF8A00 0%, transparent 40%)" }} />
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-20">
            <div className="inline-flex items-center gap-2 bg-brand-blue/20 border border-brand-blue/30 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-8">
              <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
              Communauté Data & IA en Afrique
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
              Bienvenue à <span className="text-brand-orange">Data Afrique Hub</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-10">
              La communauté passionnée qui se consacre à libérer le potentiel de la data science et de l'intelligence artificielle en Afrique.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-orange hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:scale-105">
                Rejoignez-nous <ArrowRight size={18} />
              </Link>
              <Link href="/events" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-semibold rounded-xl backdrop-blur-sm transition-all duration-200">
                Voir les événements
              </Link>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 80L1440 80L1440 20C1200 60 960 0 720 20C480 40 240 10 0 40L0 80Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* STATS */}
        <section className="bg-white py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { icon: Users, value: 30, suffix: "+", label: "Membres actifs", color: "text-brand-blue" },
                { icon: BookOpen, value: 50, suffix: "+", label: "Personnes formées", color: "text-brand-orange" },
                { icon: Globe, value: 10, suffix: "+", label: "Pays représentés", color: "text-brand-navy" },
              ].map(({ icon: Icon, value, suffix, label, color }) => (
                <div key={label} className="text-center p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gray-50 mb-4 ${color}`}><Icon size={26} /></div>
                  <div className={`text-4xl font-bold mb-2 ${color}`}><AnimatedCounter target={value} suffix={suffix} /></div>
                  <p className="text-gray-500 text-sm font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ACTIVITÉS */}
        <section className="bg-brand-navy py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ce que nous faisons</h2>
              <p className="text-white/60 max-w-xl mx-auto">DAH structure ses activités autour de quatre piliers qui forment l&apos;ADN de notre communauté.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activities.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="group bg-brand-orange rounded-2xl p-6 text-white hover:scale-105 transition-transform duration-200 cursor-default">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors"><Icon size={22} /></div>
                  <h3 className="font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ÉVÉNEMENTS */}
        {upcomingEvents.length > 0 && (
          <section className="bg-gray-50 py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-bold text-brand-navy mb-2">Prochains événements</h2>
                  <p className="text-gray-500">Rejoignez-nous lors de nos prochains rendez-vous</p>
                </div>
                <Link href="/events" className="hidden sm:inline-flex items-center gap-2 text-brand-blue font-medium hover:gap-3 transition-all text-sm">
                  Tous les événements <ChevronRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group">
                    <div className="h-40 bg-gradient-to-br from-brand-navy to-brand-blue relative">
                      <div className="absolute inset-0 flex items-center justify-center opacity-20"><CalendarDays size={80} className="text-white" /></div>
                      <div className="absolute top-3 left-3">
                        <span className="bg-brand-orange text-white text-xs font-semibold px-2.5 py-1 rounded-full">{eventTypeLabel(event.event_type)}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-brand-navy line-clamp-2 mb-3 group-hover:text-brand-blue transition-colors">{event.title}</h3>
                      <div className="space-y-1.5 text-sm text-gray-500">
                        <div className="flex items-center gap-2"><CalendarDays size={14} className="shrink-0 text-brand-blue" />{formatDate(event.start_date)}</div>
                        {event.location && <div className="flex items-center gap-2"><MapPin size={14} className="shrink-0 text-brand-orange" /><span className="line-clamp-1">{event.location}</span></div>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* MEMBRES */}
        {featuredMembers.length > 0 && (
          <section id="membres" className="bg-white py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-bold text-brand-navy mb-2">Notre communauté</h2>
                  <p className="text-gray-500">Des experts data et IA engagés pour l&apos;Afrique</p>
                </div>
                <Link href="/members" className="hidden sm:inline-flex items-center gap-2 text-brand-blue font-medium hover:gap-3 transition-all text-sm">
                  Voir tous les membres <ChevronRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredMembers.map((member) => {
                  const fullName = `${member.first_name} ${member.last_name}`;
                  const avatar = member.avatar ?? avatarUrl(fullName, 80);
                  return (
                    <Link
                      key={member.slug}
                      href={`/members/${member.slug}`}
                      className="group flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-brand-blue/25 hover:shadow-md transition-all duration-200 bg-white"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={avatar}
                          alt={fullName}
                          className="w-14 h-14 rounded-xl object-cover border-2 border-gray-100 group-hover:border-brand-blue/30 transition-colors"
                        />
                        <div className={`absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-white ${roleBadgeColor(member.role)}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-brand-navy group-hover:text-brand-blue transition-colors text-sm leading-tight">{fullName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{roleLabel(member.role)}</p>
                        {member.current_job && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {member.current_job.title}
                            <span className="text-brand-orange"> @ {member.current_job.company}</span>
                          </p>
                        )}
                        {member.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {member.skills.slice(0, 3).map((skill) => (
                              <span key={skill} className="px-1.5 py-0.5 bg-brand-blue/8 text-brand-blue text-[10px] font-medium rounded border border-brand-blue/15">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link href="/members" className="inline-flex items-center gap-2 text-brand-blue font-medium text-sm">
                  Voir tous les membres <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* TÉMOIGNAGES */}
        <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #04041A 0%, #051640 100%)" }}>
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ils parlent de DAH</h2>
              <p className="text-white/60">Ce que nos membres disent de leur expérience</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-brand-orange fill-brand-orange" />)}</div>
                  <p className="text-white/70 text-sm leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full" />
                    <div><p className="font-semibold text-white text-sm">{t.name}</p><p className="text-white/50 text-xs">{t.role}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="relative bg-brand-blue py-20 overflow-hidden">
          <img
            src="/images/collaboration-img.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/95 via-brand-blue/90 to-brand-navy/80" />
          <div className="relative max-w-3xl mx-auto px-4 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Prêt à rejoindre l&apos;aventure ?</h2>
            <p className="text-blue-100 mb-8 text-lg">Faites partie d&apos;une communauté qui façonne l&apos;avenir de la data en Afrique.</p>
            <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-blue font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
              Devenir membre <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
