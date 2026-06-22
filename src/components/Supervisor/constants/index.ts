// app/supervisor/dashboard/constants/index.ts
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { StatusConfig, ThesisGroup, ThesisStatus } from "../types";

export const statusConfig: Record<ThesisStatus, StatusConfig> = {
  submitted: {
    label: "Submitted",
    icon: CheckCircle2,
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  action_needed: {
    label: "Action Needed",
    icon: AlertCircle,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
};

export const mockGroups: ThesisGroup[] = [
  {
    id: "G01",
    name: "G01",
    domain: "Network Security",
    groupNo: "Thesis [BSCS] [G12]",
    status: "completed",
  },
  {
    id: "G02",
    name: "G02",
    domain: "Data Science",
    groupNo: "Thesis [BSCS] [G48]",
    status: "submitted",
  },
  // {
  //   id: "G03",
  //   name: "G03",
  //   domain: "Data Science",
  //   groupNo: "Thesis [BSCS] [G67]",
  //   status: "action_needed",
  // },
];

export const semesters = [
  { value: "spring-2026", label: "Spring 2025-26" },
  { value: "fall-2026", label: "Fall 2025-26" },
  { value: "spring-2025", label: "Spring 2024-25" },
  { value: "fall-2025", label: "Fall 2024-25" },
];
