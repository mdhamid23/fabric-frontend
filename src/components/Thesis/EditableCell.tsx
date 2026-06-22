"use client";

import { Edit2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  isEdited?: boolean;
}

export function EditableField({
  value,
  onSave,
  placeholder = "—",
  isEdited = false,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    if (isEditing) {
      onSave(editValue);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSave(editValue);
      setIsEditing(false);
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const handleClick = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full rounded border-2 border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1.5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`group relative cursor-text rounded px-2 py-1.5 transition-all ${
        isEdited
          ? "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500"
          : "bg-green-50 dark:bg-green-900/20 border-l-4 border-blue-500"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-sm ${!value ? "text-gray-400 dark:text-gray-500 italic" : "text-gray-700 dark:text-gray-300"}`}
        >
          {value || placeholder}
        </span>
        <Edit2 className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
