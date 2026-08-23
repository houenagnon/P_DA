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
