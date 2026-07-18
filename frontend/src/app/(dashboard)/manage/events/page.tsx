"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useAuth";
import { eventsService } from "@/services/events.service";
import { formatDateTime, eventTypeLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Plus, CalendarDays, Edit2, Trash2, Users, Eye, EyeOff, X, Check, Download } from "lucide-react";
import { isAdmin, isBureau } from "@/types/auth.types";
import Link from "next/link";
import type { Event, EventWritePayload, EventType } from "@/types/events.types";

const EVENT_TYPES: EventType[] = ["webinaire", "conference", "atelier", "hackathon", "meetup", "formation", "autre"];

const emptyForm: EventWritePayload = {
  title: "", description: "", event_type: "webinaire", start_date: "",
  end_date: "", registration_deadline: "", location: "", online_link: "",
  max_participants: undefined, is_published: false,
};

export default function EventsManagePage() {
  const { data: user } = useCurrentUser();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventWritePayload>(emptyForm);

  const canManage = user && (isAdmin(user.role) || isBureau(user.role));

  const { data, isLoading } = useQuery({
    queryKey: ["events", "manage"],
    queryFn: () => eventsService.list().then((r) => r.data),
  });

  const createEvent = useMutation({
    mutationFn: (data: EventWritePayload | FormData) => eventsService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["events"] }); setShowForm(false); setForm(emptyForm); },
  });

  const updateEvent = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EventWritePayload> }) => eventsService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["events"] }); setEditingId(null); },
  });

  const deleteEvent = useMutation({
    mutationFn: (id: string) => eventsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });

  const togglePublish = (event: Event) => {
    updateEvent.mutate({ id: event.id, data: { is_published: !event.is_published } });
  };

  const all: Event[] = data?.results ?? data ?? [];
  const now = new Date();
  const upcoming = all.filter(e => new Date(e.start_date) >= now);
  const past = all.filter(e => new Date(e.start_date) < now);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Événements</h1>
          <p className="text-gray-500 text-sm mt-1">{all.length} événement{all.length > 1 ? "s" : ""} au total</p>
        </div>
        {canManage && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Créer un événement
          </button>
        )}
      </div>

      {/* Formulaire création */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-brand-blue/20 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-navy">Nouvel événement</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <EventForm form={form} setForm={setForm} onSubmit={(payload) => createEvent.mutate(payload)} isPending={createEvent.isPending} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-20 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Événements à venir */}
          <Section title="À venir" count={upcoming.length}>
            {upcoming.map(event => (
              <EventRow key={event.id} event={event} canManage={!!canManage}
                onTogglePublish={() => togglePublish(event)}
                onDelete={() => { if (confirm("Supprimer cet événement ?")) deleteEvent.mutate(event.id); }}
                editingId={editingId} setEditingId={setEditingId}
                onUpdate={(data) => updateEvent.mutate({ id: event.id, data })}
              />
            ))}
          </Section>
          <Section title="Passés" count={past.length}>
            {past.map(event => (
              <EventRow key={event.id} event={event} canManage={!!canManage}
                onTogglePublish={() => togglePublish(event)}
                onDelete={() => { if (confirm("Supprimer cet événement ?")) deleteEvent.mutate(event.id); }}
                editingId={editingId} setEditingId={setEditingId}
                onUpdate={(data) => updateEvent.mutate({ id: event.id, data })}
              />
            ))}
          </Section>
        </>
      )}
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-medium text-gray-500 text-sm uppercase tracking-wide mb-3">{title} ({count})</h2>
      {count === 0 ? <p className="text-gray-400 text-sm py-4 text-center bg-white rounded-xl border border-gray-100">Aucun événement</p> : <div className="space-y-3">{children}</div>}
    </div>
  );
}

function EventRow({ event, canManage, onTogglePublish, onDelete, editingId, setEditingId, onUpdate }: {
  event: Event; canManage: boolean;
  onTogglePublish: () => void; onDelete: () => void;
  editingId: string | null; setEditingId: (id: string | null) => void;
  onUpdate: (data: Partial<EventWritePayload>) => void;
}) {
  const [editTitle, setEditTitle] = useState(event.title);

  function handleExport() {
    eventsService.export(event.id).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `participants_${event.id}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 group">
      <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center shrink-0">
        <CalendarDays size={18} className="text-brand-navy" />
      </div>
      <div className="flex-1 min-w-0">
        {editingId === event.id ? (
          <div className="flex items-center gap-2">
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="flex-1 border border-brand-blue rounded-lg px-2 py-1 text-sm focus:outline-none" />
            <button onClick={() => { onUpdate({ title: editTitle }); setEditingId(null); }} className="text-green-500 hover:text-green-600"><Check size={16} /></button>
            <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
          </div>
        ) : (
          <p className="font-medium text-brand-navy text-sm truncate">{event.title}</p>
        )}
        <div className="flex items-center flex-wrap gap-2 mt-1">
          <Badge variant={event.is_published ? "green" : "gray"}>{event.is_published ? "Publié" : "Brouillon"}</Badge>
          <span className="text-xs text-gray-400">{eventTypeLabel(event.event_type)}</span>
          <span className="text-xs text-gray-400">{formatDateTime(event.start_date)}</span>
          <span className="text-xs text-gray-400 flex items-center gap-1"><Users size={10} /> {event.participant_count}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Link href={`/manage/events/${event.id}/participants`} title="Participants" className="p-2 text-gray-400 hover:text-brand-blue rounded-lg hover:bg-gray-50">
          <Users size={16} />
        </Link>
        <button onClick={handleExport} title="Exporter Excel" className="p-2 text-gray-400 hover:text-brand-blue rounded-lg hover:bg-gray-50">
          <Download size={16} />
        </button>
        {canManage && <>
          <button onClick={onTogglePublish} title={event.is_published ? "Dépublier" : "Publier"} className="p-2 text-gray-400 hover:text-brand-blue rounded-lg hover:bg-gray-50">
            {event.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button onClick={() => setEditingId(event.id)} className="p-2 text-gray-400 hover:text-brand-blue rounded-lg hover:bg-gray-50"><Edit2 size={16} /></button>
          <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
        </>}
      </div>
    </div>
  );
}

const fileInputCls = "w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-brand-blue/10 file:text-brand-blue file:text-sm file:font-medium hover:file:bg-brand-blue/20 border border-gray-200 rounded-xl";

function EventForm({ form, setForm, onSubmit, isPending }: {
  form: EventWritePayload;
  setForm: React.Dispatch<React.SetStateAction<EventWritePayload>>;
  onSubmit: (payload: EventWritePayload | FormData) => void;
  isPending: boolean;
}) {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [recapFile, setRecapFile] = useState<File | null>(null);

  function handleSubmit() {
    if (!coverFile && !recapFile) {
      onSubmit(form);
      return;
    }
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") formData.append(key, String(value));
    });
    if (coverFile) formData.append("cover_image", coverFile);
    if (recapFile) formData.append("recap_image", recapFile);
    onSubmit(formData);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <input placeholder="Titre *" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="sm:col-span-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
      <textarea placeholder="Description *" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} className="sm:col-span-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none" />
      <select value={form.event_type} onChange={e => setForm(f => ({...f, event_type: e.target.value as EventType}))} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white">
        {EVENT_TYPES.map(t => <option key={t} value={t}>{eventTypeLabel(t)}</option>)}
      </select>
      <input type="number" placeholder="Participants max" value={form.max_participants ?? ""} onChange={e => setForm(f => ({...f, max_participants: e.target.value ? parseInt(e.target.value) : undefined}))} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
      <div><label className="block text-xs text-gray-500 mb-1">Date de début *</label><input type="datetime-local" value={form.start_date} onChange={e => setForm(f => ({...f, start_date: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" /></div>
      <div><label className="block text-xs text-gray-500 mb-1">Date de fin</label><input type="datetime-local" value={form.end_date ?? ""} onChange={e => setForm(f => ({...f, end_date: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" /></div>
      <input placeholder="Lieu" value={form.location ?? ""} onChange={e => setForm(f => ({...f, location: e.target.value}))} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
      <input type="url" placeholder="Lien en ligne" value={form.online_link ?? ""} onChange={e => setForm(f => ({...f, online_link: e.target.value}))} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" />
      <div>
        <label className="block text-xs text-gray-500 mb-1">Image de couverture</label>
        <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] ?? null)} className={fileInputCls} />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Image récapitulative (après l&apos;évènement)</label>
        <input type="file" accept="image/*" onChange={e => setRecapFile(e.target.files?.[0] ?? null)} className={fileInputCls} />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
        <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({...f, is_published: e.target.checked}))} className="rounded" />
        Publier immédiatement
      </label>
      <div className="sm:col-span-2 flex justify-end">
        <button onClick={handleSubmit} disabled={isPending || !form.title || !form.description || !form.start_date} className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {isPending ? "Création..." : "Créer l'événement"}
        </button>
      </div>
    </div>
  );
}
