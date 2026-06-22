import {
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  XCircle,
} from "lucide-react";
export interface Student {
  id: string;
  name: string;
}

export type ThesisGroupStatus =
  | "submitted"
  | "action_needed"
  | "resubmitted"
  | "completed";

export interface ThesisGroup {
  id: string;
  serial: string;
  classId: string;
  groupNo: string;
  supervisorId: string;
  supervisorName: string;
  extId: string;
  students: {
    id: string;
    name: string;
  }[];
  thesisMgmtRemark?: string;
  status: ThesisGroupStatus;
  remark?: string;
  registrationCompleted: boolean;
  registrationStatus?: string | null;
  isEdited?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
  count: number;
}

export const statusColors = {
  submitted: {
    bg: "bg-blue-100 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    icon: Clock,
  },
  "action-needed": {
    bg: "bg-red-100 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-400",
    icon: AlertCircle,
  },
  resubmitted: {
    bg: "bg-yellow-100 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-400",
    icon: RefreshCw,
  },
  cancelled: {
    bg: "bg-gray-100 dark:bg-gray-900/20",
    text: "text-gray-700 dark:text-gray-400",
    icon: XCircle,
  },
  complete: {
    bg: "bg-green-100 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    icon: CheckCircle,
  },
};

export const registrationColors = {
  completed: {
    bg: "bg-green-100 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
  },
  pending: {
    bg: "bg-yellow-100 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-400",
  },
};

export interface OBEStudent {
  studentId: string;
  studentName: string;
  cos: {
    co1: number;
    co2: number;
    co3: number;
    co4: number;
    co5: number;
  };
}

export interface OBEGroup {
  groupNo: string;
  classId: string;
  supervisorId: string;
  supervisorName: string;
  students: OBEStudent[];
  submissions: {
    researchProposal: boolean;
    literatureReview: boolean;
    methodology: boolean;
    book: boolean;
    plagiarismReport: boolean;
    aiReport: boolean;
    slide: boolean;
    poster: boolean;
    obeMarksheet: boolean;
  };
}

export const submissionIcons = {
  submitted: "🏆",
  pending: "📋",
  missing: "❌",
};
