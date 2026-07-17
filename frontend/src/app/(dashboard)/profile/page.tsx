"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useAuth";
import { membersService } from "@/services/members.service";
import { avatarUrl, formatDate, roleLabel } from "@/lib/utils";
import { Edit2, Plus, Trash2, ExternalLink, GitBranch, Link2, Globe, Check, X, Lock, AlertTriangle } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useDeleteAccount } from "@/hooks/useAuth";
import type { MemberProfile, MemberExperience, MemberCertification } from "@/types/members.types";

export default function ProfilePage() {
  const { data: user } = useCurrentUser();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => membersService.myProfile().then((r) => r.data),
    retry: 1,
  });

  const updateProfile = useMutation({
    mutationFn: (data: Partial<MemberProfile>) => membersService.updateProfile(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-profile"] }),
  });

  const [editBio, setEditBio] = useState(false);
  const [bioValue, setBioValue] = useState("");
  const [editSkills, setEditSkills] = useState(false);
  const [skillsValue, setSkillsValue] = useState("");

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gray-200 rounded-2xl" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-brand-navy">Mon profil</h1>

      {/* Identité */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start gap-5">
          <div className="relative">
            <img
              src={user?.avatar ?? avatarUrl(user?.full_name ?? "U", 80)}
              alt={user?.full_name}
              className="w-20 h-20 rounded-2xl border-2 border-brand-blue object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-brand-navy">{user?.full_name}</h2>
            <p className="text-brand-orange font-medium text-sm">{roleLabel(user?.role ?? "")}</p>
            {profile?.member_number && (
              <span className="inline-block mt-1 text-xs bg-brand-navy text-white px-2.5 py-0.5 rounded-full">
                {profile.member_number}
              </span>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-500">
              <span>{user?.email}</span>
              {user?.phone && <span>{user.phone}</span>}
              {profile?.created_at && <span>Membre depuis {formatDate(profile.created_at)}</span>}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-brand-navy text-sm">Bio</h3>
            <button onClick={() => { setEditBio(true); setBioValue(profile?.bio ?? ""); }} className="text-brand-blue text-xs flex items-center gap-1 hover:underline">
              <Edit2 size={12} /> Modifier
            </button>
          </div>
          {editBio ? (
            <div className="space-y-2">
              <textarea value={bioValue} onChange={(e) => setBioValue(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditBio(false)} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"><X size={12} /></button>
                <button onClick={() => { updateProfile.mutate({ bio: bioValue }); setEditBio(false); }} className="px-3 py-1.5 text-xs bg-brand-blue text-white rounded-lg hover:bg-blue-700 flex items-center gap-1">
                  <Check size={12} /> Sauvegarder
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm leading-relaxed">{profile?.bio || <span className="text-gray-300 italic">Aucune bio renseignée</span>}</p>
          )}
        </div>

        {/* Compétences */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-brand-navy text-sm">Compétences</h3>
            <button onClick={() => { setEditSkills(true); setSkillsValue((profile?.skills ?? []).join(", ")); }} className="text-brand-blue text-xs flex items-center gap-1 hover:underline">
              <Edit2 size={12} /> Modifier
            </button>
          </div>
          {editSkills ? (
            <div className="space-y-2">
              <input value={skillsValue} onChange={(e) => setSkillsValue(e.target.value)} placeholder="Python, SQL, Tableau, ..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
              <p className="text-xs text-gray-400">Séparez les compétences par des virgules</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditSkills(false)} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"><X size={12} /></button>
                <button onClick={() => { updateProfile.mutate({ skills: skillsValue.split(",").map(s => s.trim()).filter(Boolean) }); setEditSkills(false); }} className="px-3 py-1.5 text-xs bg-brand-blue text-white rounded-lg hover:bg-blue-700 flex items-center gap-1">
                  <Check size={12} /> Sauvegarder
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile?.skills?.length ? profile.skills.map((s: string) => (
                <span key={s} className="bg-brand-blue/10 text-brand-blue text-xs px-3 py-1 rounded-full font-medium">{s}</span>
              )) : <span className="text-gray-300 text-sm italic">Aucune compétence ajoutée</span>}
            </div>
          )}
        </div>

        {/* Liens */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <h3 className="font-medium text-brand-navy text-sm mb-3">Liens</h3>
          <div className="space-y-2">
            {[
              { key: "github_url", icon: GitBranch, label: "GitHub", placeholder: "https://github.com/..." },
              { key: "linkedin_url", icon: Link2, label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
              { key: "website_url", icon: Globe, label: "Site web", placeholder: "https://monsite.com" },
            ].map(({ key, icon: Icon, label, placeholder }) => (
              <div key={key} className="flex items-center gap-3">
                <Icon size={16} className="text-gray-400 shrink-0" />
                <input
                  type="url"
                  defaultValue={(profile as Record<string, string>)?.[key] ?? ""}
                  placeholder={placeholder}
                  onBlur={(e) => { if (e.target.value !== (profile as Record<string, string>)?.[key]) updateProfile.mutate({ [key]: e.target.value }); }}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
                {(profile as Record<string, string>)?.[key] && (
                  <a href={(profile as Record<string, string>)[key]} target="_blank" rel="noopener noreferrer" className="text-brand-blue">
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expériences */}
      <ExperiencesSection profile={profile} />

      {/* Certifications */}
      <CertificationsSection profile={profile} />

      {/* Mot de passe */}
      <PasswordSection />

      {/* Zone de danger */}
      <DeleteAccountSection />
    </div>
  );
}

function ExperiencesSection({ profile }: { profile: MemberProfile | undefined }) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", company: "", start_date: "", end_date: "", is_current: false, description: "" });

  const createExp = useMutation({
    mutationFn: (data: typeof form) =>
      membersService.experiences.create({
        ...data,
        // Un DateField Django rejette "" (attend une date valide ou null)
        end_date: data.is_current || !data.end_date ? null : data.end_date,
      } as Omit<MemberExperience, "id">),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-profile"] }); setAdding(false); setForm({ title: "", company: "", start_date: "", end_date: "", is_current: false, description: "" }); },
  });
  const deleteExp = useMutation({
    mutationFn: (id: number) => membersService.experiences.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-profile"] }),
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-brand-navy">Expériences professionnelles</h2>
        <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-brand-blue hover:underline">
          <Plus size={14} /> Ajouter
        </button>
      </div>

      {adding && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Poste *" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm col-span-2" />
            <input placeholder="Organisation *" value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input type="date" placeholder="Date de début" value={form.start_date} onChange={e => setForm(f => ({...f, start_date: e.target.value}))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
              <input type="checkbox" checked={form.is_current} onChange={e => setForm(f => ({...f, is_current: e.target.checked}))} />
              Poste actuel
            </label>
            {!form.is_current && <input type="date" placeholder="Date de fin" value={form.end_date} onChange={e => setForm(f => ({...f, end_date: e.target.value}))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />}
            <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2} className="border border-gray-200 rounded-lg px-3 py-2 text-sm col-span-2 resize-none" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg">Annuler</button>
            <button onClick={() => createExp.mutate(form)} disabled={!form.title || !form.company || !form.start_date} className="px-4 py-1.5 text-xs bg-brand-blue text-white rounded-lg disabled:opacity-50">
              {createExp.isPending ? "..." : "Ajouter"}
            </button>
          </div>
        </div>
      )}

      {profile?.experiences?.length === 0 && !adding && (
        <p className="text-gray-400 text-sm py-4 text-center italic">Aucune expérience ajoutée</p>
      )}
      <div className="space-y-4">
        {profile?.experiences?.map((exp: MemberExperience) => (
          <div key={exp.id} className="flex items-start gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-brand-navy flex items-center justify-center text-white shrink-0 mt-0.5">
              <span className="text-xs font-bold">{exp.company.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-brand-navy text-sm">{exp.title}</p>
                  <p className="text-brand-blue text-xs">{exp.company}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {formatDate(exp.start_date)} — {exp.is_current ? "Présent" : exp.end_date ? formatDate(exp.end_date) : "?"}
                  </p>
                </div>
                <button onClick={() => deleteExp.mutate(exp.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity p-1">
                  <Trash2 size={14} />
                </button>
              </div>
              {exp.description && <p className="text-gray-500 text-xs leading-relaxed mt-1">{exp.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PasswordSection() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ old_password: "", new_password: "", new_password_confirm: "" });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () => authService.changePassword(form),
    onSuccess: () => {
      setSuccess(true);
      setError("");
      setForm({ old_password: "", new_password: "", new_password_confirm: "" });
      setTimeout(() => setSuccess(false), 4000);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg ?? "Mot de passe actuel incorrect.");
    },
  });

  const valid = form.old_password && form.new_password.length >= 8 && form.new_password === form.new_password_confirm;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lock size={16} className="text-brand-navy" />
        <h2 className="font-semibold text-brand-navy">Changer le mot de passe</h2>
      </div>
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-700 flex items-center gap-2">
          <Check size={14} /> Mot de passe modifié avec succès
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600">{error}</div>
      )}
      <div className="space-y-3">
        {[
          { key: "old_password", label: "Mot de passe actuel", placeholder: "••••••••" },
          { key: "new_password", label: "Nouveau mot de passe", placeholder: "Minimum 8 caractères" },
          { key: "new_password_confirm", label: "Confirmer", placeholder: "Répéter le nouveau mot de passe" },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-xs text-gray-500 mb-1">{label}</label>
            <input
              type="password"
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>
        ))}
        {form.new_password && form.new_password_confirm && form.new_password !== form.new_password_confirm && (
          <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
        )}
        <div className="flex justify-end">
          <button
            onClick={() => mutation.mutate()}
            disabled={!valid || mutation.isPending}
            className="px-5 py-2 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {mutation.isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const deleteAccount = useDeleteAccount();

  function handleDelete() {
    setError("");
    deleteAccount.mutate(password, {
      onError: (err: unknown) => {
        const detail = (err as { response?: { data?: { detail?: { password?: string[] } | string } } })?.response?.data?.detail;
        if (typeof detail === "object" && detail?.password) {
          setError(detail.password[0]);
        } else {
          setError(typeof detail === "string" ? detail : "Mot de passe incorrect.");
        }
      },
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-red-100 p-6">
      <button
        onClick={() => { setOpen((o) => !o); setPassword(""); setError(""); }}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          <h2 className="font-semibold text-red-600">Supprimer mon compte</h2>
        </div>
        <span className="text-xs text-gray-400">{open ? "Fermer" : "Ouvrir"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-600">
            Cette action est <strong>irréversible</strong>. Toutes vos données seront définitivement supprimées.
            Entrez votre mot de passe pour confirmer.
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600">{error}</div>
          )}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleDelete}
              disabled={!password || deleteAccount.isPending}
              className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleteAccount.isPending ? "Suppression…" : "Supprimer définitivement"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CertificationsSection({ profile }: { profile: MemberProfile | undefined }) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", issuer: "", issued_date: "", credential_url: "" });

  const createCert = useMutation({
    mutationFn: (data: typeof form) => membersService.certifications.create(data as Omit<MemberCertification, "id">),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-profile"] }); setAdding(false); setForm({ title: "", issuer: "", issued_date: "", credential_url: "" }); },
  });
  const deleteCert = useMutation({
    mutationFn: (id: number) => membersService.certifications.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-profile"] }),
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-brand-navy">Certifications</h2>
        <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-brand-blue hover:underline">
          <Plus size={14} /> Ajouter
        </button>
      </div>

      {adding && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Titre *" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm col-span-2" />
            <input placeholder="Émetteur *" value={form.issuer} onChange={e => setForm(f => ({...f, issuer: e.target.value}))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input type="date" value={form.issued_date} onChange={e => setForm(f => ({...f, issued_date: e.target.value}))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input placeholder="URL de vérification" type="url" value={form.credential_url} onChange={e => setForm(f => ({...f, credential_url: e.target.value}))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm col-span-2" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg">Annuler</button>
            <button onClick={() => createCert.mutate(form)} disabled={!form.title || !form.issuer || !form.issued_date} className="px-4 py-1.5 text-xs bg-brand-blue text-white rounded-lg disabled:opacity-50">
              {createCert.isPending ? "..." : "Ajouter"}
            </button>
          </div>
        </div>
      )}

      {profile?.certifications?.length === 0 && !adding && (
        <p className="text-gray-400 text-sm py-4 text-center italic">Aucune certification ajoutée</p>
      )}
      <div className="space-y-3">
        {profile?.certifications?.map((cert: MemberCertification) => (
          <div key={cert.id} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-brand-orange/10 flex items-center justify-center shrink-0">
              <span className="text-brand-orange text-lg">🏅</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-brand-navy text-sm">{cert.title}</p>
              <p className="text-gray-500 text-xs">{cert.issuer} · {formatDate(cert.issued_date)}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {cert.credential_url && (
                <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:text-blue-700 p-1">
                  <ExternalLink size={14} />
                </a>
              )}
              <button onClick={() => deleteCert.mutate(cert.id)} className="text-red-400 hover:text-red-600 p-1">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
