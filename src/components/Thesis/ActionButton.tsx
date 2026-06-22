"use client";

import { CheckCircle, RotateCcw, Save } from "lucide-react";

interface ActionButtonsProps {
  status: "submitted" | "action_needed" | "resubmitted" | "completed";
  isEdited: boolean;
  hasThesisMgmtRemark: boolean;
  registrationCompleted: boolean;
  onSaveChanges: () => void;
  onSendBackForRevision: () => void;
  onMarkRegistrationComplete: () => void;
}

export function ActionButtons({
  status,
  isEdited,
  hasThesisMgmtRemark,
  registrationCompleted,
  onSaveChanges,
  onSendBackForRevision,
  onMarkRegistrationComplete,
}: ActionButtonsProps) {
  const isCompleted = status === "completed" || registrationCompleted;
  const canComplete = status === "submitted" || status === "resubmitted";
  const canSendBack = status === "submitted" || status === "resubmitted";

  if (isCompleted) {
    return (
      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
        Completed
      </span>
    );
  }

  if (status === "action_needed") {
    return (
      <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
        Waiting for Supervisor
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {isEdited && (
        <button
          type="button"
          onClick={onSaveChanges}
          className="inline-flex items-center justify-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          <Save className="h-3 w-3" />
          Save
        </button>
      )}

      {canSendBack && (
        <button
          type="button"
          onClick={onSendBackForRevision}
          disabled={!hasThesisMgmtRemark}
          title={
            hasThesisMgmtRemark
              ? "Send back to supervisor for correction"
              : "Add thesis management team remark first"
          }
          className="inline-flex items-center justify-center gap-1 rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-3 w-3" />
          Send Back
        </button>
      )}

      {canComplete && (
        <button
          type="button"
          onClick={onMarkRegistrationComplete}
          disabled={isEdited}
          title={
            isEdited
              ? "Save changes before completing registration"
              : "Mark registration as completed"
          }
          className="inline-flex items-center justify-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle className="h-3 w-3" />
          Complete
        </button>
      )}
    </div>
  );
}
