export type CandidatureStatus = "pending" | "accepted" | "rejected";

export interface CandidaturePayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country: string;
  profession: string;
  linkedin_url?: string;
  motivation: string;
}

export interface CandidatureList {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  profession: string;
  status: CandidatureStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by_name: string | null;
}

export interface CandidatureDetail extends CandidatureList {
  phone: string;
  linkedin_url: string;
  motivation: string;
  rejection_reason: string;
  cv: string | null;
}

export interface ReviewPayload {
  action: "accept" | "reject";
  rejection_reason?: string;
}
