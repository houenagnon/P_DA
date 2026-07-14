export type EventType = "webinaire" | "conference" | "atelier" | "hackathon" | "meetup" | "formation" | "autre";

export interface EventSpeaker {
  id: number;
  name: string;
  bio: string;
  photo: string | null;
  user: number | null;
}

export interface Event {
  id: string;
  title: string;
  event_type: EventType;
  cover_image: string | null;
  start_date: string;
  end_date: string | null;
  registration_deadline: string | null;
  location: string;
  online_link: string;
  is_published: boolean;
  participant_count: number;
  max_participants: number | null;
  is_full: boolean;
  is_registered: boolean;
}

export interface EventDetail extends Event {
  description: string;
  speakers: EventSpeaker[];
  qr_code: string | null;
  created_by_name: string;
  created_at: string;
}

export interface EventWritePayload {
  title: string;
  description: string;
  event_type: EventType;
  start_date: string;
  end_date?: string;
  registration_deadline?: string;
  location?: string;
  online_link?: string;
  max_participants?: number;
  is_published: boolean;
}

export interface EventParticipant {
  id: number;
  user_id: number;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  created_at: string;
  presence_validated: boolean;
  attended_at: string | null;
  motivation: string;
}
