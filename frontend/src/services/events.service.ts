import { api } from "@/lib/axios";
import type { EventWritePayload } from "@/types/events.types";

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

  register: (id: string, motivation?: string) =>
    api.post(`/events/${id}/register/`, { motivation: motivation ?? "" }),

  participants: (id: string) =>
    api.get(`/events/${id}/participants/`),

  validatePresence: (eventId: string, userId: number) =>
    api.post(`/events/${eventId}/validate/${userId}/`),

  export: (id: string) =>
    api.get(`/events/${id}/export/`, { responseType: "blob" }),
};
