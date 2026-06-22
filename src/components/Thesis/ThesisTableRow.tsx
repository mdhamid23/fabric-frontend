"use client";

import { motion } from "framer-motion";
import { ThesisGroup } from "../Admin/types";
import { ActionButtons } from "./ActionButton";
import { EditableField } from "./EditableCell";
import { RegistrationBadge } from "./registration-badge";
import { StatusBadge } from "./status-badge";
import { StudentsList } from "./studentList";

interface ThesisTableRowProps {
  group: ThesisGroup;
  onUpdateGroup: (
    groupId: string,
    field: keyof ThesisGroup,
    value: string,
  ) => void;
  onSaveChanges: (groupId: string) => void;
  onSendBackForRevision: (groupId: string) => void;
  onMarkRegistrationComplete: (groupId: string) => void;
}

export function ThesisTableRow({
  group,
  onUpdateGroup,
  onSaveChanges,
  onSendBackForRevision,
  onMarkRegistrationComplete,
}: ThesisTableRowProps) {
  const registrationStatus =
    group.registrationCompleted || group.status === "completed"
      ? "completed"
      : "pending";

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
        group.isEdited ? "bg-green-50/50 dark:bg-green-900/5" : ""
      }`}
    >
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-[#0a0a0a] z-10">
        {group.serial}
      </td>

      <td className="px-4 py-3">
        <EditableField
          value={group.classId ?? ""}
          onSave={(value) => onUpdateGroup(group.id, "classId", value)}
          isEdited={group.isEdited}
        />
      </td>

      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
        {group.groupNo}
      </td>

      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {group.supervisorId}
      </td>

      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {group.supervisorName}
      </td>

      <td className="px-4 py-3">
        <EditableField
          value={group.extId ?? ""}
          onSave={(value) => onUpdateGroup(group.id, "extId", value)}
          isEdited={group.isEdited}
        />
      </td>

      <td className="px-4 py-3">
        <StudentsList students={group.students} type="id" />
      </td>

      <td className="px-4 py-3">
        <StudentsList students={group.students} type="name" />
      </td>

      <td className="px-4 py-3">
        <EditableField
          value={group.thesisMgmtRemark ?? ""}
          onSave={(value) => onUpdateGroup(group.id, "thesisMgmtRemark", value)}
          placeholder="Add remark..."
          isEdited={group.isEdited}
        />
      </td>

      <td className="px-4 py-3">
        <StatusBadge status={group.status} />
      </td>

      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
        {group.remark || "—"}
      </td>

      <td className="px-4 py-3">
        <RegistrationBadge status={registrationStatus} />
      </td>

      <td className="px-4 py-3">
        <ActionButtons
          status={group.status}
          isEdited={Boolean(group.isEdited)}
          hasThesisMgmtRemark={Boolean(group.thesisMgmtRemark?.trim())}
          registrationCompleted={Boolean(group.registrationCompleted)}
          onSaveChanges={() => onSaveChanges(group.id)}
          onSendBackForRevision={() => onSendBackForRevision(group.id)}
          onMarkRegistrationComplete={() =>
            onMarkRegistrationComplete(group.id)
          }
        />
      </td>
    </motion.tr>
  );
}
