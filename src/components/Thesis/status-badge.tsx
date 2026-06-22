"use client";

import { AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";

const STATUS_META = {
  submitted: {
    label: "Submitted",
    icon: Clock,
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  },
  action_needed: {
    label: "Action Needed",
    icon: AlertCircle,
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  },
  resubmitted: {
    label: "Resubmitted",
    icon: RefreshCw,
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  },
} as const;

export function StatusBadge({ status }: { status: keyof typeof STATUS_META }) {
  const meta = STATUS_META[status] ?? STATUS_META.submitted;
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${meta.className}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}
