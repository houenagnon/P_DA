import { api } from "@/lib/axios";
import type { EventWritePayload, EventRegistrationPayload, ParticipantLookupResult } from "@/types/events.types";

export const eventsService = {
  list: (params?: Record<string, string>) =>
    api.get("/events/", { params }),

  get: (id: string) =>
    api.get(`/events/${id}/`),

  create: (data: EventWritePayload) =>
    api.post("/events/", data),

  update: (id: string, data: Partial<EventWritePayload>) =>
    api.patch(`/events/${id}/`, data),

  delete: (id: string) =>
    api.delete(`/events/${id}/`),

  register: (id: string, data: EventRegistrationPayload) =>
    api.post(`/events/${id}/register/`, data),

  lookupParticipant: (email: string) =>
    api.get<ParticipantLookupResult>("/events/participants/lookup/", { params: { email } }),

  participants: (id: string) =>
    api.get(`/events/${id}/participants/`),

  validatePresence: (eventId: string, participantId: number) =>
    api.post(`/events/${eventId}/validate/${participantId}/`),

  export: (id: string) =>
    api.get(`/events/${id}/export/`, { responseType: "blob" }),
};
