"use client";

import { Student } from "../Admin/types";

interface StudentsListProps {
  students: Student[];
  type: "id" | "name";
}

export function StudentsList({ students, type }: StudentsListProps) {
  return (
    <div className="space-y-1">
      {students.map((student, idx) => (
        <div key={idx} className="text-sm text-gray-600 dark:text-gray-400">
          {type === "id" ? student.id : student.name}
        </div>
      ))}
    </div>
  );
}
