// app/supervisor/dashboard/page.tsx
"use client";

import { ThesisGroup } from "@/components/Admin/types";
import { SemesterSelector } from "@/components/Supervisor/SemesterSelector";
import { ThesisGroupCard } from "@/components/Supervisor/ThesisGroupCard";
import { useThesisGroups } from "@/hooks/useThesisGroup";
import {
  createSupervisorApprovalRequestApi,
  getSupervisorApprovalRequestsApi,
} from "@/resources/thesis-group/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  Send,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function SupervisorDashboard() {
  const {
    groups,
    semesters,
    selectedSemesterData,
    selectedSemesterLabel,
    selectedSemester,
    supervisorId,
    isLoading,
    error,
    handleViewDetails,
    handleSemesterChange,
  } = useThesisGroups();

  const router = useRouter();
  const queryClient = useQueryClient();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_GROUPS_WITHOUT_APPROVAL = 3;
  const currentGroupCount = groups.length;
  // const supervisorId = groups[0]?.supervisorId ?? "current-supervisor-id";

  const approvalRequestsQuery = useQuery({
    queryKey: ["supervisor-approval-requests", supervisorId, selectedSemester],
    queryFn: () =>
      getSupervisorApprovalRequestsApi({
        supervisorId,
        semesterId: selectedSemester || undefined,
      }),
    enabled:
      Boolean(selectedSemester) && supervisorId !== "current-supervisor-id",
  });

  const approvedGroupLimit = Math.max(
    MAX_GROUPS_WITHOUT_APPROVAL,
    ...(approvalRequestsQuery.data ?? [])
      .filter(
        (request) =>
          request.status === "approved" && request.type === "additional_groups",
      )
      .map((request) => request.groupCount ?? 0),
  );

  const lastRequestedGroupCount = Math.max(
    approvedGroupLimit,
    ...(approvalRequestsQuery.data ?? [])
      .filter(
        (request) =>
          request.type === "additional_groups" && request.status !== "rejected",
      )
      .map((request) => request.groupCount ?? 0),
  );

  const nextRequestedGroupCount = lastRequestedGroupCount + 1;

  const needsApproval = currentGroupCount >= approvedGroupLimit;
  const remainingGroupsWithoutNewApproval = Math.max(
    approvedGroupLimit - currentGroupCount,
    0,
  );

  const requestApprovalMutation = useMutation({
    mutationFn: async () =>
      createSupervisorApprovalRequestApi({
        supervisorId,
        semesterId: selectedSemester || undefined,
        type: "additional_groups",
        message: requestMessage.trim(),
        groupCount: nextRequestedGroupCount,
        reason: requestMessage.trim(),
        attachments: attachedFiles,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            "supervisor-approval-requests",
            supervisorId,
            selectedSemester,
          ],
        }),
        queryClient.invalidateQueries({
          queryKey: ["supervisor-dashboard", supervisorId, selectedSemester],
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

  const formatDate = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
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
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word")) return "📝";
    if (fileType.includes("image")) return "🖼️";
    return "📎";
  };

  const handleRequestApproval = async () => {
    await requestApprovalMutation.mutateAsync();
  };

  const isRequesting = requestApprovalMutation.isPending;

  const handleAddGroup = () => {
    if (needsApproval) {
      setShowRequestModal(true);
    } else {
      router.push("/supervisor/create-group");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#040404]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Active Deadlines Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Active Deadlines ({selectedSemesterLabel})
            </h2>
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
                    {deadline.status === "upcoming" && (
                      <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                        Upcoming
                      </span>
                    )}
                    {deadline.status === "completed" && (
                      <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {deadline.startDate} - {deadline.endDate}
                  </p>
                </div>
              );
            })}
            {activeDeadlines.length === 0 && (
              <div className="col-span-full rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No semester deadlines are available.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Groups Limit Warning Banner */}
        <div className="mb-6">
          <div
            className={`rounded-lg border p-4 ${
              needsApproval
                ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`h-5 w-5 mt-0.5 ${
                    needsApproval
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                />
                <div>
                  <h3
                    className={`text-sm font-semibold ${
                      needsApproval
                        ? "text-yellow-800 dark:text-yellow-300"
                        : "text-blue-800 dark:text-blue-300"
                    }`}
                  >
                    {needsApproval
                      ? "Department Approval Required"
                      : "Groups Limit Information"}
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      needsApproval
                        ? "text-yellow-700 dark:text-yellow-300/80"
                        : "text-blue-700 dark:text-blue-300/80"
                    }`}
                  >
                    {needsApproval
                      ? `You currently have ${currentGroupCount} thesis groups. For more than ${approvedGroupLimit} groups, you need approval from the department.`
                      : `You have ${currentGroupCount} of ${approvedGroupLimit} groups currently allowed. You can add ${remainingGroupsWithoutNewApproval} more group(s) directly.`}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {needsApproval ? (
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 px-4 py-2 text-sm font-medium text-white transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    Request Approval
                  </button>
                ) : (
                  <button
                    onClick={handleAddGroup}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      needsApproval
                        ? "border border-yellow-600 bg-transparent text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                        : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                    }`}
                  >
                    <span>+ Add Group</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Header with Title */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-black dark:text-white">
              Thesis Groups
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage and monitor your assigned thesis groups
            </p>
          </div>

          {/* Semester Selector - Right aligned */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4 mt-3">
            <SemesterSelector
              semesters={semesters}
              selectedSemester={selectedSemester}
              onSemesterChange={handleSemesterChange}
            />
          </div>
        </div>

        {/* Deadlines Alert - Keep for backward compatibility */}
        {/* <DeadlinesAlert /> */}

        {/* Thesis Groups Grid or Empty State */}
        {isLoading ? (
          <div className="mb-8 flex flex-col items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] py-12 px-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading thesis groups...
            </p>
          </div>
        ) : error ? (
          <div className="mb-8 flex flex-col items-center justify-center rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 py-12 px-4">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        ) : groups.length > 0 ? (
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group: ThesisGroup) => (
              <ThesisGroupCard
                key={group.id}
                group={group}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="mb-8 flex flex-col items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] py-12 px-4">
            <div className="rounded-full bg-gray-100 dark:bg-white/10 p-4 mb-4">
              <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
              No Thesis Groups Found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
              You haven't been assigned any thesis groups for{" "}
              {selectedSemesterLabel}. Groups will appear here once assigned by
              the admin or you can create a new group.
            </p>
            <button
              onClick={handleAddGroup}
              className="flex items-center gap-2 rounded-lg bg-black dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              <span>+ Create New Group</span>
            </button>
          </div>
        )}

        {/* <SupervisorNote /> */}

        {/* Request Approval Modal with File Upload */}
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
                      Adding more than {approvedGroupLimit} groups requires
                      department approval. Please provide a reason and
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
                      placeholder="e.g., High student demand, specialized expertise, additional workload capacity, etc."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Supporting Documents (Optional)
                    </label>
                    <div className="space-y-3">
                      {/* File Upload Button */}
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

                      {/* File List */}
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
                                <span className="text-lg">
                                  {getFileIcon(file.type)}
                                </span>
                                <div>
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
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

                  {requestApprovalMutation.isError && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {requestApprovalMutation.error instanceof Error
                        ? requestApprovalMutation.error.message
                        : "Failed to send request. Please try again."}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Success Toast */}
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
                    Request sent successfully!
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
