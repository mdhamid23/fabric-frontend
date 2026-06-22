"use client";

import { USER_ROLES } from "@/lib/auth/route-permissions";
import {
  createSemester,
  deleteSemesterById,
  getSemesters,
  Semester,
  updateSemesterById,
} from "@/resources/semester/service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Edit,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const semesterSchema = z
  .object({
    semesterName: z.string().min(1, "Semester name is required"),
    groupCreationStart: z.string().min(1, "Start date is required"),
    groupCreationEnd: z.string().min(1, "End date is required"),
    midEvidenceStart: z.string().min(1, "Start date is required"),
    midEvidenceEnd: z.string().min(1, "End date is required"),
    finalEvidenceStart: z.string().min(1, "Start date is required"),
    finalEvidenceEnd: z.string().min(1, "End date is required"),
  })
  .refine((data) => data.groupCreationStart <= data.groupCreationEnd, {
    message: "Group creation end date must be on or after the start date",
    path: ["groupCreationEnd"],
  })
  .refine((data) => data.midEvidenceStart <= data.midEvidenceEnd, {
    message: "Mid evidence end date must be on or after the start date",
    path: ["midEvidenceEnd"],
  })
  .refine((data) => data.finalEvidenceStart <= data.finalEvidenceEnd, {
    message: "Final evidence end date must be on or after the start date",
    path: ["finalEvidenceEnd"],
  });

type SemesterData = z.infer<typeof semesterSchema>;

type AuthCookieResponse = {
  authenticated: boolean;
  user?: {
    id: number;
    username: string;
    email: string;
    roles: string[];
  };
};

const MANAGE_SEMESTER_ROLES = [
  USER_ROLES.ADMIN as string,
  USER_ROLES.THESIS_ADMIN as string,
];

async function getCurrentAuthUser(): Promise<AuthCookieResponse | null> {
  const response = await fetch("/api/auth/cookie", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}
export default function CreateSemesterPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState<Semester | null>(
    null,
  );
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<
    "created" | "updated" | null
  >(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const authUserQuery = useQuery({
    queryKey: ["current-auth-user"],
    queryFn: getCurrentAuthUser,
  });
  const router = useRouter();

  const userRoles = authUserQuery.data?.user?.roles ?? [];

  const canAccessAdmin =
    userRoles.includes("ROLE_ADMIN") ||
    userRoles.includes("ROLE_THESIS_ADMIN") ||
    userRoles.includes("ROLE_THESIS_CONVENER") ||
    userRoles.includes("ROLE_THESIS_MEMBER");

  // useEffect(() => {
  //   if (authUserQuery.isLoading) {
  //     return;
  //   }

  //   if (!canAccessAdmin) {
  //     router.replace("/supervisor/dashboard");
  //   }
  // }, [authUserQuery.isLoading, canAccessAdmin, router]);

  const canManageSemester = userRoles.some((role) =>
    MANAGE_SEMESTER_ROLES.includes(role),
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SemesterData>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      semesterName: "",
      groupCreationStart: "",
      groupCreationEnd: "",
      midEvidenceStart: "",
      midEvidenceEnd: "",
      finalEvidenceStart: "",
      finalEvidenceEnd: "",
    },
  });

  const semestersQuery = useQuery({
    queryKey: ["semesters"],
    queryFn: getSemesters,
  });

  const createSemesterMutation = useMutation({
    mutationFn: createSemester,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["semesters"] });
    },
  });

  const updateSemesterMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SemesterData }) =>
      updateSemesterById(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["semesters"] });
    },
  });

  const deleteSemesterMutation = useMutation({
    mutationFn: deleteSemesterById,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["semesters"] });
    },
  });

  const semesters = semestersQuery.data ?? [];
  const isLoadingSemesters = semestersQuery.isLoading;
  const isRefreshing = semestersQuery.isRefetching;
  const isSubmitting =
    createSemesterMutation.isPending || updateSemesterMutation.isPending;
  const isDeleting = deleteSemesterMutation.isPending;
  const queryErrorMessage =
    semestersQuery.error instanceof Error ? semestersQuery.error.message : null;
  const displayError = pageError ?? queryErrorMessage;

  const refreshSemesters = async () => {
    setPageError(null);

    const result = await semestersQuery.refetch();
    if (result.error) {
      setPageError(
        result.error instanceof Error
          ? result.error.message
          : "Failed to refresh semesters. Please try again.",
      );
    }
  };

  const onSubmit = async (data: SemesterData) => {
    if (!canManageSemester) {
      setPageError("You do not have permission to manage semesters.");
      return;
    }
    setPageError(null);

    try {
      if (editingSemester) {
        await updateSemesterMutation.mutateAsync({
          id: editingSemester.id,
          payload: data,
        });
        setSubmitSuccess("updated");
      } else {
        await createSemesterMutation.mutateAsync(data);
        setSubmitSuccess("created");
      }

      setTimeout(() => setSubmitSuccess(null), 3000);
      handleCloseModal();
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Failed to save semester. Please try again.",
      );
    }
  };

  const handleEdit = (semester: Semester) => {
    setEditingSemester(semester);
    reset(semester);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (semester: Semester) => {
    setSemesterToDelete(semester);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!semesterToDelete) return;

    setPageError(null);

    try {
      await deleteSemesterMutation.mutateAsync(semesterToDelete.id);
      setIsDeleteModalOpen(false);
      setSemesterToDelete(null);
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Failed to delete semester. Please try again.",
      );
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSemesterToDelete(null);
  };

  const handleAddNew = () => {
    setEditingSemester(null);
    reset({
      semesterName: "",
      groupCreationStart: "",
      groupCreationEnd: "",
      midEvidenceStart: "",
      midEvidenceEnd: "",
      finalEvidenceStart: "",
      finalEvidenceEnd: "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSemester(null);
    reset();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (authUserQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!canAccessAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Page Title and Add Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
              Manage Semester{JSON.stringify(userRoles, null, 2)}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage thesis semesters and their deadlines
            </p>
          </div>
          {canManageSemester && (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 rounded-lg bg-black dark:bg-white px-4 py-2 text-white dark:text-black font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Semester
            </button>
          )}
        </div>

        {/* Success Messages */}
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
                  Semester {submitSuccess} successfully!
                </p>
              </div>
            </motion.div>
          )}

          {deleteSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-green-700 dark:text-green-300">
                  Semester deleted successfully!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {displayError && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="text-red-700 dark:text-red-300">{displayError}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPageError(null);
                  void refreshSemesters();
                }}
                disabled={isRefreshing}
                className="rounded-md border border-red-300 dark:border-red-700 px-3 py-1 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50"
              >
                {isRefreshing ? "Retrying..." : "Retry"}
              </button>
            </div>
          </div>
        )}

        {/* Semesters Table */}
        <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#050505] border-b border-gray-200 dark:border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Semester Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Group Creation
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Mid Evidence Upload
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Final Evidence Upload
                  </th>
                  {canManageSemester && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {isLoadingSemesters && (
                  <tr>
                    <td
                      colSpan={canManageSemester ? 5 : 4}
                      className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      Loading semesters...
                    </td>
                  </tr>
                )}
                {semesters.map((semester) => (
                  <motion.tr
                    key={semester.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {semester.semesterName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDate(semester.groupCreationStart)} -{" "}
                          {formatDate(semester.groupCreationEnd)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDate(semester.midEvidenceStart)} -{" "}
                          {formatDate(semester.midEvidenceEnd)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDate(semester.finalEvidenceStart)} -{" "}
                          {formatDate(semester.finalEvidenceEnd)}
                        </span>
                      </div>
                    </td>
                    {canManageSemester && (
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(semester)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            title="Edit semester"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(semester)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                            title="Delete semester"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isLoadingSemesters && semesters.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No semesters created yet
              </p>
              {canManageSemester && (
                <button
                  onClick={handleAddNew}
                  className="mt-4 text-black dark:text-white underline"
                >
                  Create your first semester
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal for Create/Edit Semester */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0a0a0a] rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-black dark:text-white">
                  {editingSemester ? "Edit Semester" : "Create New Semester"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Semester Name *
                  </label>
                  <input
                    {...register("semesterName")}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="e.g., Spring 2025-26"
                  />
                  {errors.semesterName && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.semesterName.message}
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                  <h3 className="text-lg font-medium text-black dark:text-white mb-4">
                    Group Creation Period
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        {...register("groupCreationStart")}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      />
                      {errors.groupCreationStart && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.groupCreationStart.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        {...register("groupCreationEnd")}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      />
                      {errors.groupCreationEnd && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.groupCreationEnd.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                  <h3 className="text-lg font-medium text-black dark:text-white mb-4">
                    Mid Evidence Upload Period
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        {...register("midEvidenceStart")}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      />
                      {errors.midEvidenceStart && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.midEvidenceStart.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        {...register("midEvidenceEnd")}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      />
                      {errors.midEvidenceEnd && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.midEvidenceEnd.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                  <h3 className="text-lg font-medium text-black dark:text-white mb-4">
                    Final Evidence Upload Period
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        {...register("finalEvidenceStart")}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      />
                      {errors.finalEvidenceStart && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.finalEvidenceStart.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        {...register("finalEvidenceEnd")}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      />
                      {errors.finalEvidenceEnd && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.finalEvidenceEnd.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-md bg-black dark:bg-white px-6 py-2 text-white dark:text-black font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingSemester
                        ? "Update Semester"
                        : "Create Semester"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && semesterToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0a0a0a] rounded-lg w-full max-w-md"
            >
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-center text-black dark:text-white mb-2">
                  Delete Semester
                </h3>

                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-black dark:text-white">
                    "{semesterToDelete.semesterName}"
                  </span>
                  ? This action cannot be undone and will remove all associated
                  data.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="flex-1 rounded-md bg-red-600 dark:bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700 dark:hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
