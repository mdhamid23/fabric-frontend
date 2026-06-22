"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Download, Filter } from "lucide-react";
import { useState } from "react";
import { FilterOption } from "../Admin/types";
import { SemesterSelector } from "../Supervisor/SemesterSelector";

interface FilterSectionProps {
  filters: FilterOption[];
  selectedFilters: string[];
  onFilterToggle: (filterValue: string) => void;
  onDownload: () => void;
  downloading: boolean;
  semesters?: Array<{ value: string; label: string }>;
  selectedSemester: string;
  onSemesterChange: (value: string) => void;
}

export function FilterSection({
  filters,
  selectedFilters,
  onFilterToggle,
  onDownload,
  downloading,
  semesters,
  selectedSemester,
  onSemesterChange,
}: FilterSectionProps) {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-black dark:text-white mb-1">
            Download Thesis Group File using the following filters
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select status filters to download specific groups
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <div className="pt-6">
            <SemesterSelector
              semesters={semesters}
              selectedSemester={selectedSemester}
              onSemesterChange={onSemesterChange}
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Filters</span>
              {selectedFilters.length > 0 && (
                <span className="ml-1 rounded-full bg-black dark:bg-white px-1.5 py-0.5 text-xs text-white dark:text-black">
                  {selectedFilters.length}
                </span>
              )}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${isFilterDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {isFilterDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] shadow-lg z-20"
                >
                  <div className="p-2">
                    {filters.map((filter) => (
                      <label
                        key={filter.value}
                        className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedFilters.includes(filter.value)}
                            onChange={() => onFilterToggle(filter.value)}
                            className="rounded border-gray-300 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {filter.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({filter.count})
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 rounded-lg bg-black dark:bg-white px-3 py-2 text-sm text-white dark:text-black font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            {downloading ? "Downloading..." : "Download"}
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedFilters.map((filter) => {
            const filterLabel = filters.find((f) => f.value === filter)?.label;
            return (
              <span
                key={filter}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs text-gray-700 dark:text-gray-300"
              >
                {filterLabel}
                <button
                  onClick={() => onFilterToggle(filter)}
                  className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
