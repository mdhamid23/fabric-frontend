"use client";

import { Download } from "lucide-react";

interface DownloadButtonProps {
  onDownload: () => void;
  isDownloading?: boolean;
}

export function DownloadButton({
  onDownload,
  isDownloading = false,
}: DownloadButtonProps) {
  return (
    <div className="mb-6 flex justify-end">
      <button
        onClick={onDownload}
        disabled={isDownloading}
        className="flex items-center gap-2 rounded-lg bg-black dark:bg-white px-6 py-2.5 text-white dark:text-black font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {isDownloading ? "Downloading..." : "Download OBE Marks"}
      </button>
    </div>
  );
}
