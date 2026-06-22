"use client";

type RegistrationStatus = "completed" | "pending";

const REGISTRATION_META = {
  completed: {
    label: "Completed",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  },
  pending: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  },
} as const;

export function RegistrationBadge({
  status,
}: {
  status?: RegistrationStatus | null;
}) {
  const normalizedStatus: RegistrationStatus =
    status === "completed" ? "completed" : "pending";

  const meta = REGISTRATION_META[normalizedStatus];

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
