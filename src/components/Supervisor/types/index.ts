// app/supervisor/dashboard/types/index.ts
export type ThesisStatus =
  | "submitted"
  | "action_needed"
  | "completed"
  | "completed";

export interface ThesisGroup {
  id: string;
  semesterId?: string;
  supervisorId?: string;
  name: string;
  domain: string;
  groupNo: string;
  status: ThesisStatus;
  supervisorGroup?: string;
}

export interface StatusConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}
