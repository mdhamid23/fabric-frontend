"use client";

import { FilterOption } from "../Admin/types";

interface SummaryStatsProps {
  filters: FilterOption[];
}

export function SummaryStats({ filters }: SummaryStatsProps) {
  return (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
      {filters.map((filter) => (
        <div
          key={filter.value}
          className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-4"
        >
          <div className="text-2xl font-bold text-black dark:text-white">
            {filter.count}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filter.label}
          </div>
        </div>
      ))}
    </div>
  );
}
