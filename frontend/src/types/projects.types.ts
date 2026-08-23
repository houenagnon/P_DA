export type ProjectStatus = "idea" | "active" | "paused" | "completed" | "archived";

export interface Project {
  id: number;
  title: string;
  description: string;
  status: ProjectStatus;
  status_display: string;
  owner_id: number | null;
  owner_name: string | null;
  member_names: string[];
  department_name: string | null;
  deadline: string | null;
  repository_url: string;
  created_at: string;
}

export interface ProjectWritePayload {
  title: string;
  description: string;
  status: ProjectStatus;
  department?: number | null;
  deadline?: string | null;
  repository_url?: string;
  members?: number[];
}
