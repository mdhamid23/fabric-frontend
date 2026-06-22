"use client";

import { Edit2, FileText } from "lucide-react";
import { ThesisGroup } from "../Admin/types";
import { ThesisTableRow } from "./ThesisTableRow";

interface ThesisTableProps {
  groups: ThesisGroup[];
  onUpdateGroup: (
    groupId: string,
    field: keyof ThesisGroup,
    value: string,
  ) => void;
  onSaveChanges: (groupId: string) => void;
  onSendBackForRevision: (groupId: string) => void;
  onMarkRegistrationComplete: (groupId: string) => void;
}

export function ThesisTable({
  groups,
  onUpdateGroup,
  onSaveChanges,
  onSendBackForRevision,
  onMarkRegistrationComplete,
}: ThesisTableProps) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">
          No thesis groups found
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Try adjusting your filters or search term
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] overflow-x-auto">
      <div className="min-w-[1400px]">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-[#050505] border-b border-gray-200 dark:border-white/10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white sticky left-0 bg-gray-50 dark:bg-[#050505] z-10">
                Serial
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[150px]">
                <div className="flex items-center gap-1.5">
                  Class ID
                  <Edit2 className="h-3 w-3 text-blue-500" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[100px]">
                Group No
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[120px]">
                Supervisor Id
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[150px]">
                Supervisor Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[120px]">
                <div className="flex items-center gap-1.5">
                  Ext Id
                  <Edit2 className="h-3 w-3 text-blue-500" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[150px]">
                Students ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[200px]">
                Students Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[200px]">
                <div className="flex items-center gap-1.5">
                  Thesis Mgmt Team Remark
                  <Edit2 className="h-3 w-3 text-blue-500" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[120px]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[150px]">
                Supervisor Remark
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[150px]">
                Registration Completed
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[140px]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10">
            {groups.map((group) => (
              <ThesisTableRow
                key={group.id}
                group={group}
                onUpdateGroup={onUpdateGroup}
                onSaveChanges={onSaveChanges}
                onSendBackForRevision={onSendBackForRevision}
                onMarkRegistrationComplete={onMarkRegistrationComplete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
