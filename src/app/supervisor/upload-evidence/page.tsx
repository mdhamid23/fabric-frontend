"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Eye, FileText, Trash2, Upload } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  getGroupDocumentsApi,
  removeGroupDocumentApi,
  uploadGroupEvidenceApi,
} from "@/resources/thesis-group/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const uploadEvidenceSchema = z.object({
  plagiarismPercentage: z
    .string()
    .regex(/^(?:[0-9]|[1-9][0-9]|100)?$/, "Must be between 0-100")
    .refine(
      (val) => !val || parseInt(val) <= 19,
      "Plagiarism percentage must be 19% or less",
    )
    .optional(),
  aiDetectionPercentage: z
    .string()
    .regex(/^(?:[0-9]|[1-9][0-9]|100)?$/, "Must be between 0-100")
    .refine(
      (val) => !val || parseInt(val) <= 15,
      "AI Detection percentage must be 15% or less",
    )
    .optional(),
});

type UploadEvidenceData = z.infer<typeof uploadEvidenceSchema>;

const DOCUMENT_TYPE_BY_FIELD = {
  literatureReview: "literature_review",
  projectProposal: "project_proposal",
  progressReport: "progress_report",
  finalThesisBook: "final_thesis_book",
  plagiarismReport: "plagiarism_report",
  aiDetectionReport: "ai_detection_report",
  presentationSlide: "presentation_slide",
  poster: "poster",
} as const;

type UploadField = keyof typeof DOCUMENT_TYPE_BY_FIELD;

const DOCUMENT_FIELDS: Array<{ field: UploadField; label: string }> = [
  { field: "literatureReview", label: "Literature Review" },
  { field: "projectProposal", label: "Project Proposal" },
  { field: "progressReport", label: "Progress Report" },
  { field: "finalThesisBook", label: "Final Thesis Book" },
  { field: "plagiarismReport", label: "Plagiarism Report" },
  { field: "aiDetectionReport", label: "AI Detection Report" },
  { field: "presentationSlide", label: "Presentation Slide" },
  { field: "poster", label: "Poster" },
];

function UploadEvidenceContent() {
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId") ?? "";
  const semesterId = searchParams.get("semesterId") ?? undefined;

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});

  const uploadEvidenceMutation = useMutation({
    mutationFn: uploadGroupEvidenceApi,
  });

  const documentsQuery = useQuery({
    queryKey: ["group-documents", groupId, semesterId],
    queryFn: () => getGroupDocumentsApi({ groupId, semesterId }),
    enabled: Boolean(groupId),
  });

  const removeDocumentMutation = useMutation({
    mutationFn: removeGroupDocumentApi,
  });

  const isSubmitting = uploadEvidenceMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UploadEvidenceData>({
    resolver: zodResolver(uploadEvidenceSchema),
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, [fieldName]: file }));
    }
  };

  const onSubmit = async (data: UploadEvidenceData) => {
    setSubmitError(null);

    if (!groupId) {
      setSubmitError(
        "Group ID is missing. Please go back and open upload from a specific group card.",
      );
      return;
    }

    try {
      await uploadEvidenceMutation.mutateAsync({
        groupId,
        semesterId,
        plagiarismPercentage: data.plagiarismPercentage,
        aiDetectionPercentage: data.aiDetectionPercentage,
        files: {
          progressReport: uploadedFiles.progressReport,
          finalThesisBook: uploadedFiles.finalThesisBook,
          plagiarismReport: uploadedFiles.plagiarismReport,
          aiDetectionReport: uploadedFiles.aiDetectionReport,
          presentationSlide: uploadedFiles.presentationSlide,
          poster: uploadedFiles.poster,
        },
      });

      await documentsQuery.refetch();
      setSubmitSuccess(true);
      setUploadedFiles({});
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to upload evidence. Please try again.",
      );
    }
  };

  const getDocumentForField = (field: UploadField) =>
    documentsQuery.data?.[field] ?? undefined;

  const hasAnyUploadedDocument = DOCUMENT_FIELDS.some(
    ({ field }) => !!getDocumentForField(field),
  );

  const handleRemoveDocument = async (documentType: string) => {
    setSubmitError(null);
    if (!groupId) {
      return;
    }

    try {
      await removeDocumentMutation.mutateAsync({
        groupId,
        semesterId,
        documentType,
      });
      await documentsQuery.refetch();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to remove document. Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
            Upload Evidence
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Submit your thesis evidence and required documents
          </p>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-green-700 dark:text-green-300">
                  Evidence uploaded successfully!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <p className="text-red-700 dark:text-red-300">{submitError}</p>
            </div>
          )}

          {/* Midterm Evidence */}
          <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              Midterm Evidence
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Progress Report{" "}
                <span className="text-xs text-gray-500">(PDF, max 100 MB)</span>
              </label>
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Upload className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span>Browse...</span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "progressReport")}
                  />
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400 flex-1">
                  {uploadedFiles.progressReport?.name ||
                    getDocumentForField("progressReport")?.split("/").pop() ||
                    "No file chosen"}
                </span>
                {Boolean(getDocumentForField("progressReport")) && (
                  <div className="flex items-center gap-2">
                    <a
                      href={`/api${getDocumentForField("progressReport")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      title="View document"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument("progress_report")}
                      disabled={removeDocumentMutation.isPending}
                      className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Remove document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Final Term Evidence */}
          <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-black dark:text-white">
                Final Term Evidence
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Final Thesis Book */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Final Thesis Book{" "}
                  <span className="text-xs text-gray-500">
                    (PDF, max 100 MB)
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Upload className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span>Browse...</span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "finalThesisBook")}
                    />
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex-1 truncate">
                    {uploadedFiles.finalThesisBook?.name ||
                      getDocumentForField("finalThesisBook")
                        ?.split("/")
                        .pop() ||
                      "No file chosen"}
                  </span>
                  {Boolean(getDocumentForField("finalThesisBook")) && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`/api${getDocumentForField("finalThesisBook")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        title="View document"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveDocument("final_thesis_book")
                        }
                        disabled={removeDocumentMutation.isPending}
                        className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Remove document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Plagiarism Report */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plagiarism Report{" "}
                  <span className="text-xs text-gray-500">
                    (PDF, max 100MB)
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Upload className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span>Browse...</span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "plagiarismReport")}
                    />
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex-1 truncate">
                    {uploadedFiles.plagiarismReport?.name ||
                      getDocumentForField("plagiarismReport")
                        ?.split("/")
                        .pop() ||
                      "No file chosen"}
                  </span>
                  {Boolean(getDocumentForField("plagiarismReport")) && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`/api${getDocumentForField("plagiarismReport")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        title="View document"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveDocument("plagiarism_report")
                        }
                        disabled={removeDocumentMutation.isPending}
                        className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Remove document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Detection Report */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Detection Report{" "}
                  <span className="text-xs text-gray-500">
                    (PDF, max 100MB)
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Upload className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span>Browse...</span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "aiDetectionReport")}
                    />
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex-1 truncate">
                    {uploadedFiles.aiDetectionReport?.name ||
                      getDocumentForField("aiDetectionReport")
                        ?.split("/")
                        .pop() ||
                      "No file chosen"}
                  </span>
                  {Boolean(getDocumentForField("aiDetectionReport")) && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`/api${getDocumentForField("aiDetectionReport")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        title="View document"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveDocument("ai_detection_report")
                        }
                        disabled={removeDocumentMutation.isPending}
                        className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Remove document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Presentation Slide */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Presentation Slide{" "}
                  <span className="text-xs text-gray-500">
                    (PDF/PPTX, max 50MB)
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Upload className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span>Browse...</span>
                    <input
                      type="file"
                      accept=".pdf,.pptx,.ppt"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "presentationSlide")}
                    />
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex-1 truncate">
                    {uploadedFiles.presentationSlide?.name ||
                      getDocumentForField("presentationSlide")
                        ?.split("/")
                        .pop() ||
                      "No file chosen"}
                  </span>
                  {Boolean(getDocumentForField("presentationSlide")) && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`/api${getDocumentForField("presentationSlide")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        title="View document"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveDocument("presentation_slide")
                        }
                        disabled={removeDocumentMutation.isPending}
                        className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Remove document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Poster */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Poster{" "}
                  <span className="text-xs text-gray-500">
                    (PDF or Image, 30x48 inches)
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Upload className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span>Browse...</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "poster")}
                    />
                  </label>
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex-1 truncate">
                    {uploadedFiles.poster?.name ||
                      getDocumentForField("poster")?.split("/").pop() ||
                      "No file chosen"}
                  </span>
                  {Boolean(getDocumentForField("poster")) && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`/api${getDocumentForField("poster")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        title="View document"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument("poster")}
                        disabled={removeDocumentMutation.isPending}
                        className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Remove document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                {/* Plagiarism Percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plagiarism Percentage{" "}
                    <span className="text-xs text-red-600">(max 19%)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      {...register("plagiarismPercentage")}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      placeholder="Enter percentage"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">
                      %
                    </span>
                  </div>
                  {errors.plagiarismPercentage && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.plagiarismPercentage.message}
                    </p>
                  )}
                </div>
                {/* AI Detection Percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    AI Detection Percentage{" "}
                    <span className="text-xs text-red-600">(max 15%)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      {...register("aiDetectionPercentage")}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      placeholder="Enter percentage"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">
                      %
                    </span>
                  </div>
                  {errors.aiDetectionPercentage && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.aiDetectionPercentage.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-black dark:bg-white px-6 py-3 text-white dark:text-black font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Uploading..." : "Upload Evidence"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2026 Thesis Management System
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UploadEvidencePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      }
    >
      <UploadEvidenceContent />
    </Suspense>
  );
}
