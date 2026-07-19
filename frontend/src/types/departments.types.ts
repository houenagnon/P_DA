export interface DepartmentMembership {
  id: number;
  user_id: number;
  user_full_name: string;
  user_email: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  lead_id: number | null;
  lead_name: string | null;
  co_lead_id: number | null;
  co_lead_name: string | null;
  member_count: number;
  can_manage: boolean;
  created_at: string;
}

export interface DepartmentDetail extends Department {
  memberships: DepartmentMembership[];
}

export interface DepartmentWritePayload {
  name: string;
  description: string;
  lead?: number | null;
  co_lead?: number | null;
}

export interface AddMembershipPayload {
  user_id: number;
  start_date: string;
  end_date?: string;
}

export interface DepartmentAnnouncement {
  id: number;
  title: string;
  content: string;
  author_name: string | null;
  created_at: string;
}

export interface AnnouncementWritePayload {
  title: string;
  content: string;
}

export interface DepartmentSession {
  id: number;
  date: string;
  theme: string;
  report: string;
  present_member_ids: number[];
  present_count: number;
  created_at: string;
}

export interface SessionWritePayload {
  date: string;
  theme?: string;
}

export interface SessionReportPayload {
  report: string;
  present_user_ids: number[];
}

export type TaskStatus = "todo" | "in_progress" | "done" | "blocked";

export interface DepartmentTask {
  id: number;
  title: string;
  description: string;
  assigned_to_id: number | null;
  assigned_to_name: string | null;
  due_date: string | null;
  status: TaskStatus;
  status_display: string;
  created_at: string;
}

export interface TaskWritePayload {
  title: string;
  description?: string;
  assigned_to_id?: number | null;
  due_date?: string | null;
  status?: TaskStatus;
}

export interface MyDepartment {
  department: Department;
  since: string | null;
  can_manage: boolean;
  announcements: DepartmentAnnouncement[];
  sessions: DepartmentSession[];
  my_tasks: DepartmentTask[];
}
