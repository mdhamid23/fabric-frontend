"use client";

import { SemesterSelector } from "@/components/Supervisor/SemesterSelector";
import {
  getAdminApprovalRequestsApi,
  respondAdminApprovalRequestApi,
  SupervisorApprovalRequest,
} from "@/resources/thesis-group/api";
import { getSemestersApi, Semester } from "@/resources/semester/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, Download, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type RequestStatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminApprovalRequestsPage() {
  const queryClient = useQueryClient();
  const [selectedSemester, setSelectedSemester] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatusFilter>("all");

  const semestersQuery = useQuery({
    queryKey: ["semesters"],
    queryFn: getSemestersApi,
  });

  const semesterOptions = useMemo(
    () =>
      (semestersQuery.data ?? []).map((semester: Semester) => ({
        value: semester.id,
        label: semester.semesterName,
      })),
    [semestersQuery.data],
  );

  useEffect(() => {
    if (!selectedSemester && semesterOptions.length > 0) {
      setSelectedSemester(semesterOptions[0].value);
    }
  }, [selectedSemester, semesterOptions]);

  const approvalRequestsQuery = useQuery({
    queryKey: ["admin-approval-requests", selectedSemester, statusFilter],
    queryFn: () =>
      getAdminApprovalRequestsApi({
        semesterId: selectedSemester || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const respondMutation = useMutation({
    mutationFn: async ({
      requestId,
      status,
    }: {
      requestId: string;
      status: "approved" | "rejected";
    }) => respondAdminApprovalRequestApi(requestId, { status }),
    onSuccess: async (_, variables) => {
      toast.success(
        variables.status === "approved"
          ? "Request approved"
          : "Request rejected",
      );
      await queryClient.invalidateQueries({
        queryKey: ["admin-approval-requests"],
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Action failed");
    },
  });

  const requests: SupervisorApprovalRequest[] =
    approvalRequestsQuery.data ?? [];

  const handleAttachmentDownload = (path: string) => {
    const anchor = document.createElement("a");
    anchor.href = `/api${path}`;
    anchor.download = path.split("/").pop() ?? "attachment";
    anchor.click();
  };

  const getStatusBadge = (status: SupervisorApprovalRequest["status"]) => {
    if (status === "approved") {
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
    }

    if (status === "rejected") {
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
    }

    return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
            Approval Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review supervisor requests for additional thesis groups
          </p>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-auto">
            <SemesterSelector
              selectedSemester={selectedSemester}
              onSemesterChange={setSelectedSemester}
              semesters={semesterOptions}
            />
          </div>

          <div className="flex items-center gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-md px-3 py-1.5 text-sm capitalize transition-colors ${
                    statusFilter === status
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-[#0a0a0a] dark:text-gray-300 dark:hover:bg-white/10"
                  }`}
                >
                  {status}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0a0a0a]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Supervisor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Request
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Group Count
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Attachments
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Requested At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {approvalRequestsQuery.isLoading && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400"
                    >
                      Loading approval requests...
                    </td>
                  </tr>
                )}

                {!approvalRequestsQuery.isLoading && requests.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-sm text-gray-600 dark:text-gray-400"
                    >
                      No approval requests found for the selected filters.
                    </td>
                  </tr>
                )}

                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                      {request.supervisorId}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {request.type.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-[300px]">
                      <p className="line-clamp-2">{request.message}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {request.groupCount ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex flex-wrap gap-2">
                        {(request.attachments ?? []).length === 0 && (
                          <span>-</span>
                        )}
                        {(request.attachments ?? []).map((attachment, idx) => (
                          <button
                            key={`${request.id}-${idx}`}
                            onClick={() => handleAttachmentDownload(attachment)}
                            className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                          >
                            <Download className="h-3.5 w-3.5" />
                            File {idx + 1}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(request.status)}`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(request.requestDate).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            respondMutation.mutate({
                              requestId: request.id,
                              status: "approved",
                            })
                          }
                          disabled={
                            request.status !== "pending" ||
                            respondMutation.isPending
                          }
                          className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-200 disabled:opacity-50 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            respondMutation.mutate({
                              requestId: request.id,
                              status: "rejected",
                            })
                          }
                          disabled={
                            request.status !== "pending" ||
                            respondMutation.isPending
                          }
                          className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock3 className="h-4 w-4" />
          Requests are sorted by latest submission first.
        </div>
      </div>
    </div>
  );
}
