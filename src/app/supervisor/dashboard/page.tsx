"use client";

import { SemesterSelector } from "@/components/Supervisor/SemesterSelector";
import { useThesisGroups } from "@/hooks/useThesisGroup";
import {
  createSupervisorApprovalRequestApi,
  getSupervisorApprovalRequestsApi,
  getSupervisorDashboardApi,
  SupervisorApprovalRequest,
  SupervisorRecentActivity,
} from "@/resources/thesis-group/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Clock as ClockIcon,
  FileText,
  Send,
  Trash2,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const MAX_GROUPS_WITHOUT_APPROVAL = 3;

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatRelativeTime = (value: string) => {
  const target = new Date(value).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - target);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return "just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

const getDeadlineStatus = (startDate: string, endDate: string) => {
  const today = new Date();
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59`);

  if (today < start) {
    return "upcoming";
  }

  if (today > end) {
    return "completed";
  }

  return "active";
};

const resolveDashboardActivityType = (
  type: SupervisorRecentActivity["type"],
): "submission" | "review" | "approval" | "comment" => {
  if (type === "evidence_uploaded") {
    return "submission";
  }

  if (type === "approval_request") {
    return "approval";
  }

  if (type === "group_updated") {
    return "review";
  }

  return "comment";
};

const resolveDashboardActivityStatus = (
  status: SupervisorRecentActivity["status"],
): "success" | "warning" | "info" => status;

export default function SupervisorDashboard() {
  const {
    groups,
    semesters,
    selectedSemesterData,
    selectedSemester,
    handleSemesterChange,
    supervisorId,
    role,
    isAuthLoading,
  } = useThesisGroups();

  const router = useRouter();
  const queryClient = useQueryClient();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // const supervisorId = groups[0]?.supervisorId ?? "";
  const currentGroupCount = groups.length;
  const needsApproval = currentGroupCount >= MAX_GROUPS_WITHOUT_APPROVAL;

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (role === "admin") {
      router.replace("/admin/semester");
      return;
    }

    if (role !== "supervisor") {
      router.replace("/");
    }
  }, [isAuthLoading, role, router]);

  const dashboardQuery = useQuery({
    queryKey: ["supervisor-dashboard", supervisorId, selectedSemester],
    queryFn: () =>
      getSupervisorDashboardApi({
        supervisorId: supervisorId || undefined,
        semesterId: selectedSemester || undefined,
      }),
    enabled: Boolean(selectedSemester),
  });

  const approvalRequestsQuery = useQuery({
    queryKey: ["supervisor-approval-requests", supervisorId, selectedSemester],
    queryFn: () =>
      getSupervisorApprovalRequestsApi({
        supervisorId: supervisorId || undefined,
        semesterId: selectedSemester || undefined,
      }),
    enabled: Boolean(selectedSemester),
  });

  const requestApprovalMutation = useMutation({
    mutationFn: async () => {
      return createSupervisorApprovalRequestApi({
        supervisorId: supervisorId || "current-supervisor-id",
        semesterId: selectedSemester || undefined,
        type: "additional_groups",
        message: requestMessage,
        groupCount: currentGroupCount + 1,
        reason: requestMessage,
        attachments: attachedFiles,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["supervisor-dashboard", supervisorId, selectedSemester],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            "supervisor-approval-requests",
            supervisorId,
            selectedSemester,
          ],
        }),
      ]);

      setIsRequestSent(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setIsRequestSent(false);
        setRequestMessage("");
        setAttachedFiles([]);
      }, 2000);
    },
  });

  const activeDeadlines = selectedSemesterData
    ? [
        {
          title: "Group Creation",
          startDate: formatDate(selectedSemesterData.groupCreationStart),
          endDate: formatDate(selectedSemesterData.groupCreationEnd),
          status: getDeadlineStatus(
            selectedSemesterData.groupCreationStart,
            selectedSemesterData.groupCreationEnd,
          ),
          icon: Users,
        },
        {
          title: "Mid Evidence",
          startDate: formatDate(selectedSemesterData.midEvidenceStart),
          endDate: formatDate(selectedSemesterData.midEvidenceEnd),
          status: getDeadlineStatus(
            selectedSemesterData.midEvidenceStart,
            selectedSemesterData.midEvidenceEnd,
          ),
          icon: FileText,
        },
        {
          title: "Final Evidence",
          startDate: formatDate(selectedSemesterData.finalEvidenceStart),
          endDate: formatDate(selectedSemesterData.finalEvidenceEnd),
          status: getDeadlineStatus(
            selectedSemesterData.finalEvidenceStart,
            selectedSemesterData.finalEvidenceEnd,
          ),
          icon: Calendar,
        },
      ]
    : [];

  const groupsBySemester = dashboardQuery.data?.groupsBySemester ?? [];
  const recentActivities = (dashboardQuery.data?.recentActivities ?? []).map(
    (activity) => ({
      id: activity.id,
      type: resolveDashboardActivityType(activity.type),
      title: activity.title,
      description: activity.description,
      time: formatRelativeTime(activity.timestamp),
      groupNo: activity.groupNo ?? null,
      status: resolveDashboardActivityStatus(activity.status),
    }),
  );

  const approvalRequests =
    approvalRequestsQuery.data ?? ([] as SupervisorApprovalRequest[]);

  const stats = dashboardQuery.data?.stats ?? {
    totalGroups: groups.length,
    totalStudents: groupsBySemester.reduce(
      (acc, item) => acc + item.students,
      0,
    ),
    completedGroups: groups.filter((g) => g.status === "completed").length,
    pendingRequests: approvalRequests.filter((r) => r.status === "pending")
      .length,
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (role !== "supervisor") {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
      case "upcoming":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "completed":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      default:
        return "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400";
    }
  };

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400">
            <CheckCircle className="h-3 w-3" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/20 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400">
            <ClockIcon className="h-3 w-3" />
            Pending
          </span>
        );
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidSize = file.size <= 10 * 1024 * 1024;
      const isValidType = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
      ].includes(file.type);

      if (!isValidSize) {
        alert(`${file.name} is too large. Max size is 10MB.`);
      }
      if (!isValidType) {
        alert(
          `${file.name} has invalid format. Allowed: PDF, DOC, DOCX, JPG, PNG`,
        );
      }

      return isValidSize && isValidType;
    });

    setAttachedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "[PDF]";
    if (fileType.includes("word")) return "[DOC]";
    if (fileType.includes("image")) return "[IMG]";
    return "[FILE]";
  };

  const handleRequestApproval = async () => {
    await requestApprovalMutation.mutateAsync();
  };

  const handleAddGroup = () => {
    if (needsApproval) {
      setShowRequestModal(true);
    } else {
      router.push("/supervisor/create-group");
    }
  };

  const isRequesting = requestApprovalMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#040404]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Welcome back, Supervisor
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Here is an overview of your thesis supervision activities
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/20 p-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-black dark:text-white">
                {stats.totalGroups}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Groups
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {selectedSemester || "All semesters"}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-2">
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl font-bold text-black dark:text-white">
                {stats.totalStudents}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Students
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Across groups
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-purple-100 dark:bg-purple-900/20 p-2">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-black dark:text-white">
                {stats.completedGroups}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Completed
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Thesis groups
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900/20 p-2">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-2xl font-bold text-black dark:text-white">
                {stats.pendingRequests}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pending Requests
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Awaiting response
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-black dark:text-white">
                Active Deadlines
              </h2>
            </div>
            <SemesterSelector
              semesters={semesters}
              selectedSemester={selectedSemester}
              onSemesterChange={handleSemesterChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeDeadlines.map((deadline) => {
              const Icon = deadline.icon;
              return (
                <div
                  key={deadline.title}
                  className={`rounded-lg border p-4 ${getStatusColor(deadline.status)} bg-white dark:bg-[#0a0a0a]`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`rounded-lg p-2 ${getStatusColor(deadline.status)}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium text-black dark:text-white">
                      {deadline.title}
                    </h3>
                    {deadline.status === "active" && (
                      <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {deadline.startDate} - {deadline.endDate}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Groups by Semester
            </h2>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#050505] rounded-lg">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Semester
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                    Groups
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                    Students
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                    Completed
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                    Ongoing
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupsBySemester.length > 0 ? (
                  groupsBySemester.map((semester) => (
                    <tr
                      key={`${semester.semesterId}-${semester.semesterName}`}
                      className="border-t border-gray-200 dark:border-white/10"
                    >
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {semester.semesterName}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                        {semester.count}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                        {semester.students}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-green-600 dark:text-green-400">
                        {semester.completed}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-yellow-600 dark:text-yellow-400">
                        {semester.ongoing}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No semester summary available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-black dark:text-white">
                  Recent Activities
                </h2>
              </div>
            </div>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    <div
                      className={`mt-0.5 rounded-full p-1 ${
                        activity.status === "success"
                          ? "bg-green-100 dark:bg-green-900/20"
                          : activity.status === "warning"
                            ? "bg-yellow-100 dark:bg-yellow-900/20"
                            : "bg-blue-100 dark:bg-blue-900/20"
                      }`}
                    >
                      {activity.type === "submission" && (
                        <FileText className="h-3 w-3 text-green-600" />
                      )}
                      {activity.type === "review" && (
                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                      )}
                      {activity.type === "approval" && (
                        <CheckCircle className="h-3 w-3 text-blue-600" />
                      )}
                      {activity.type === "comment" && (
                        <Activity className="h-3 w-3 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-medium text-black dark:text-white">
                          {activity.title}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {activity.description}
                      </p>
                      {activity.groupNo && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 mt-1 inline-block">
                          Group {activity.groupNo}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No recent activity yet
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-black dark:text-white">
                  Approval Requests
                </h2>
              </div>
              {needsApproval && (
                <button
                  onClick={handleAddGroup}
                  className="rounded-lg bg-yellow-600 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-700"
                >
                  New Request
                </button>
              )}
            </div>
            <div className="space-y-3">
              {approvalRequests.length > 0 ? (
                approvalRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border-b border-gray-100 dark:border-white/10 pb-3 last:border-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-medium text-black dark:text-white">
                          {request.type === "additional_groups"
                            ? "Additional Groups Request"
                            : request.type === "extension"
                              ? "Extension Request"
                              : "Other Request"}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Requested on{" "}
                          {new Date(request.requestDate).toLocaleDateString()}
                        </p>
                      </div>
                      {getRequestStatusBadge(request.status)}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {request.message}
                    </p>
                    {request.status !== "pending" && request.responseDate && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Responded:{" "}
                        {new Date(request.responseDate).toLocaleDateString()}
                      </p>
                    )}
                    {request.status === "pending" && (
                      <div className="mt-2 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-yellow-500 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No approval requests found
                </p>
              )}
            </div>
          </div>
        </div>

        {needsApproval && (
          <div className="mb-6">
            <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                      Department Approval Required
                    </h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300/80 mt-1">
                      You currently have {currentGroupCount} thesis groups. For
                      more than {MAX_GROUPS_WITHOUT_APPROVAL} groups, you need
                      approval from the department.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAddGroup}
                  className="flex items-center gap-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 px-4 py-2 text-sm font-medium text-white transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Request Approval
                </button>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showRequestModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg rounded-lg bg-white dark:bg-[#0a0a0a] shadow-xl max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-4">
                  <h2 className="text-lg font-semibold text-black dark:text-white">
                    Request Department Approval
                  </h2>
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      You currently have {currentGroupCount} thesis groups.
                      Adding more than {MAX_GROUPS_WITHOUT_APPROVAL} groups
                      requires department approval. Please provide a reason and
                      supporting documents.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reason for Request *
                    </label>
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] p-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      placeholder="e.g., High student demand, specialized expertise, additional workload capacity"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Supporting Documents (Optional)
                    </label>
                    <div className="space-y-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#050505] px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        Click to upload or drag and drop
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Supported formats: PDF, DOC, DOCX, JPG, PNG (Max size:
                        10MB each)
                      </p>

                      {attachedFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Attached Files ({attachedFiles.length})
                          </p>
                          {attachedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] p-2"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  {getFileIcon(file.type)}
                                </span>
                                <div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[220px]">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => removeFile(index)}
                                className="rounded-lg p-1 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleRequestApproval}
                      disabled={!requestMessage.trim() || isRequesting}
                      className="flex-1 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRequesting ? "Sending..." : "Send Request"}
                    </button>
                    <button
                      onClick={() => setShowRequestModal(false)}
                      className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {(dashboardQuery.isLoading ||
                    approvalRequestsQuery.isLoading) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Loading dashboard data...
                    </p>
                  )}
                  {(dashboardQuery.error || approvalRequestsQuery.error) && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Failed to load some dashboard data.
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isRequestSent && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 z-50 rounded-lg bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-200 dark:bg-green-800 p-1">
                  <Send className="h-4 w-4 text-green-700 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    Request sent successfully
                  </p>
                  {attachedFiles.length > 0 && (
                    <p className="text-xs text-green-700 dark:text-green-400">
                      {attachedFiles.length} file(s) attached
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
