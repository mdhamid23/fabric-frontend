// app/supervisor/dashboard/components/ThesisGroupCard.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { statusConfig } from "./constants";
import { ThesisGroup } from "./types";

interface ThesisGroupCardProps {
  group: any;
  onViewDetails: (groupId: string) => void;
}

export function ThesisGroupCard({
  group,
  onViewDetails,
}: ThesisGroupCardProps) {
  const status =
    statusConfig[group.status as "submitted" | "action_needed" | "completed"] ||
    statusConfig.submitted;
  const StatusIcon = status.icon;
  const router = useRouter();
  const domainBadgeClasses = [
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-300",
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300",
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-900/20 dark:text-sky-300",
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-900/20 dark:text-violet-300",
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-900/20 dark:text-rose-300",
  ];

  const getBadgeColorIndex = (value: string) => {
    return [...value].reduce((total, char) => total + char.charCodeAt(0), 0);
  };

  const getStatusBadge = () => {
    return (
      <Badge
        variant="outline"
        className={`gap-1.5 mx-0 py-0.5 text-xs font-normal ${status.className}`}
      >
        <StatusIcon className="h-3 w-3" />
        {group.status}
      </Badge>
    );
  };
  const getDomainBadge = (domain: string) => {
    const colorClass =
      domainBadgeClasses[
        getBadgeColorIndex(domain) % domainBadgeClasses.length
      ];

    return (
      <Badge
        variant="outline"
        className={`gap-1.5 mx-0 border py-0.5 text-xs font-medium ${colorClass}`}
      >
        {domain}
      </Badge>
    );
  };
  const getGroupBadge = (groupNo: string) => {
    return (
      <Badge
        variant="outline"
        className="mx-0 border-indigo-200 bg-indigo-50 py-0.5 text-xs font-medium text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-900/20 dark:text-indigo-300"
      >
        {groupNo}
      </Badge>
    );
  };

  return (
    <Card className="group relative overflow-hidden border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-800 dark:from-[#050505] dark:to-[#030303]">
      {/* Decorative gradient line on top */}
      <div
        className={`absolute top-0 left-0 h-0.5 w-full transition-all duration-300 ${
          group.status === "submitted"
            ? "bg-gradient-to-r from-green-500 to-emerald-500"
            : group.status === "action_needed"
              ? "bg-gradient-to-r from-red-500 to-rose-500"
              : "bg-gradient-to-r from-gray-400 to-gray-500"
        }`}
      />

      <CardHeader className="pb-1 pt-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              {group.supervisorGroup ?? "-"} - {group.name.slice(0, 32) + "..."}
            </h3>
            {group.domain ? (
              <div className="mt-2 space-y-0 flex gap-0.5">
                {getGroupBadge(group.groupNo)}
                {getDomainBadge(group.domain)}
                {getStatusBadge()}
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                No domain set
              </p>
            )}
          </div>
          {/* {getStatusBadge()} */}
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-0">
        <div className="flex items-center justify-end border-t border-gray-100 pt-2 dark:border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams({ groupId: group.id });
              if (group.semesterId) {
                params.set("semesterId", group.semesterId);
              }
              router.push(`/supervisor/upload-evidence?${params.toString()}`);
            }}
            className="h-7 gap-1.5 px-2 text-xs text-gray-600 transition-all duration-200 hover:gap-2 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <Upload className="h-3 w-3" />
            <span className="text-xs font-medium">Upload Evidence</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/supervisor/groups/${group.id}/edit`)}
            className="h-7 gap-1.5 px-2 text-xs text-gray-600 transition-all duration-200 hover:gap-2 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <Eye className="h-3 w-3" />
            <span className="text-xs font-medium">Update</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
