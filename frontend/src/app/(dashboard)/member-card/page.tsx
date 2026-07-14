"use client";

import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useAuth";
import { membersService } from "@/services/members.service";
import { avatarUrl, formatDate, roleLabel } from "@/lib/utils";
import { Download, Share2, ExternalLink, Shield, CalendarDays } from "lucide-react";
import Link from "next/link";

export default function MemberCardPage() {
  const { data: user } = useCurrentUser();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => membersService.myProfile().then((r) => r.data),
    enabled: !!user,
    retry: false,
  });

  const fullName = user ? `${user.first_name} ${user.last_name}` : "";
  const avatar = user?.avatar ?? avatarUrl(fullName, 120);
  const memberSince = profile?.created_at ? formatDate(profile.created_at) : "—";
  const memberNumber = profile?.member_number ?? null;
  const publicUrl = profile?.slug ? `/portfolio/${profile.slug}` : null;

  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (publicUrl && navigator.share) {
      await navigator.share({
        title: `${fullName} — Data Afrique Hub`,
        url: window.location.origin + publicUrl,
      });
    } else if (publicUrl) {
      await navigator.clipboard.writeText(window.location.origin + publicUrl);
      alert("Lien copié !");
    }
  };

  if (isLoading || !user) return <CardSkeleton />;

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #member-card, #member-card * { visibility: visible; }
          #member-card { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-navy">Ma carte de membre</h1>
          <div className="flex gap-2 no-print">
            {publicUrl && (
              <Link href={publicUrl} target="_blank"
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                <ExternalLink size={15} /> Mon portfolio
              </Link>
            )}
            <button onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
              <Share2 size={15} /> Partager
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-blue text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
              <Download size={15} /> Télécharger
            </button>
          </div>
        </div>

        {/* Card preview */}
        <div className="flex justify-center">
          <MemberCard
            fullName={fullName}
            avatar={avatar}
            role={user.role}
            email={user.email}
            memberNumber={memberNumber}
            memberSince={memberSince}
            skills={profile?.skills ?? []}
            publicUrl={publicUrl}
          />
        </div>

        {/* Info box */}
        {!memberNumber && (
          <div className="max-w-lg mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-700 no-print">
            <p className="font-medium mb-1">Numéro de membre non encore attribué</p>
            <p className="text-amber-600">Votre numéro sera généré automatiquement après validation de votre adhésion par le bureau.</p>
          </div>
        )}

        {/* Mobile actions */}
        <div className="flex gap-3 justify-center no-print md:hidden">
          {publicUrl && (
            <Link href={publicUrl} className="flex-1 flex items-center justify-center gap-2 py-3 text-sm border border-gray-200 rounded-xl text-gray-600">
              <ExternalLink size={15} /> Portfolio
            </Link>
          )}
          <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 py-3 text-sm bg-brand-blue text-white rounded-xl font-medium">
            <Download size={15} /> Télécharger
          </button>
        </div>
      </div>
    </>
  );
}

function MemberCard({ fullName, avatar, role, email, memberNumber, memberSince, skills, publicUrl }: {
  fullName: string; avatar: string; role: string; email: string;
  memberNumber: string | null; memberSince: string; skills: string[]; publicUrl: string | null;
}) {
  return (
    <div id="member-card" className="w-[420px] select-none">
      {/* Front */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-brand-navy via-[#08082b] to-[#0c1a4a] text-white"
        style={{ aspectRatio: "1.586/1" }}>

        {/* Grid background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Orange accent top-right */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-orange/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-blue/30 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />

        <div className="relative h-full p-7 flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center font-bold text-xs shrink-0">
                  DAH
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight">Data Afrique Hub</p>
                  <p className="text-white/40 text-xs">Carte de membre</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              {memberNumber ? (
                <div>
                  <p className="text-white/40 text-xs">N° Membre</p>
                  <p className="font-mono font-bold text-brand-orange text-sm">{memberNumber}</p>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <p className="text-xs text-white/60">En attente</p>
                </div>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="flex items-end gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl border-2 border-white/20 overflow-hidden bg-brand-blue/20 shadow-lg">
                <img src={avatar} alt={fullName} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center shadow">
                <Shield size={11} className="text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pb-1">
              <h2 className="text-xl font-bold leading-tight truncate">{fullName}</h2>
              <p className="text-brand-orange font-medium text-sm mt-0.5">{roleLabel(role)}</p>
              <p className="text-white/40 text-xs mt-1 truncate">{email}</p>

              {/* Skills preview */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {skills.slice(0, 3).map((s) => (
                    <span key={s} className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/70">
                      {s}
                    </span>
                  ))}
                  {skills.length > 3 && (
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/50">
                      +{skills.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white/40 text-xs">
              <CalendarDays size={11} />
              <span>Membre depuis {memberSince}</span>
            </div>
            {publicUrl && (
              <p className="text-white/30 text-xs font-mono">dataafrique.hub{publicUrl}</p>
            )}
          </div>
        </div>
      </div>

      {/* Chip décoratif (bande magnétique) */}
      <div className="mt-4 mx-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* Verso simplifié */}
      <div className="mt-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Verso · Compétences</p>
          <div className="w-5 h-5 rounded bg-brand-blue flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">DAH</span>
          </div>
        </div>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-full">
                {s}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Aucune compétence ajoutée.</p>
        )}
        <p className="text-xs text-gray-300 mt-4 text-center">
          Ce document atteste de l&apos;appartenance à la communauté Data Afrique Hub
        </p>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded-xl animate-pulse" />
      <div className="flex justify-center">
        <div className="w-[420px] rounded-3xl bg-gray-200 animate-pulse" style={{ aspectRatio: "1.586/1" }} />
      </div>
    </div>
  );
}
