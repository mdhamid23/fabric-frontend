// src/app/supervisor/groups/[id]/edit/page.tsx
"use client";

import { getSemestersApi } from "@/resources/semester/api";
import {
  getSupervisorGroupByIdApi,
  resubmitSupervisorGroupApi,
} from "@/resources/thesis-group/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Upload, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const studentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  name: z.string().min(1, "Student name is required"),
  cgpa: z
    .string()
    .min(1, "CGPA is required")
    .regex(/^\d+\.?\d*$/, "Invalid CGPA format"),
  primaryEmail: z
    .string()
    .min(1, "Primary email is required")
    .email("Invalid email address")
    .regex(/@student\.aiub\.edu$/, "Email must end with @student.aiub.edu"),
  secondaryEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  phoneNo: z.string().min(1, "Phone number is required"),
  creditCompleted: z.string().min(1, "Credit completed is required"),
  creditTakeWithThesis: z.string().optional(),
  researchMethodologyCompleted: z.enum(["yes", "no"]).default("no"),
});

const thesisFormSchema = z.object({
  semesterId: z.string().min(1, "Semester is required"),
  supervisorId: z.string().min(1, "Supervisor ID is required"),
  supervisorName: z.string().min(1, "Supervisor name is required"),
  supervisorEmail: z.string().email("Invalid supervisor email"),
  proposedTitle: z.string().min(5, "Title must be at least 5 characters"),
  thesisDomain: z.string().min(1, "Thesis domain is required"),
  shortDescription: z
    .string()
    .min(20, "Description must be at least 20 characters"),
  supervisorRemark: z
    .string()
    .min(5, "Supervisor remark is required for resubmission"),
  literatureReview: z.any().optional(),
  projectProposal: z.any().optional(),
  numberOfStudents: z.number().min(2).max(4),
  students: z
    .array(studentSchema)
    .min(2, "Minimum 2 students required")
    .max(4, "Maximum 4 students allowed"),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms"),
});

type ThesisFormData = z.infer<typeof thesisFormSchema>;
type ThesisFormInput = z.input<typeof thesisFormSchema>;
type StudentFormData = ThesisFormData["students"][number];

const thesisDomains = [
  "Machine Learning",
  "Deep Learning",
  "Computer Vision",
  "Natural Language Processing",
  "Data Science",
  "Cybersecurity",
  "Cloud Computing",
  "Internet of Things",
  "Blockchain",
  "Robotics",
  "Software Engineering",
  "Human-Computer Interaction",
];

const createEmptyStudent = (): StudentFormData => ({
  studentId: "",
  name: "",
  cgpa: "",
  primaryEmail: "",
  secondaryEmail: "",
  phoneNo: "",
  creditCompleted: "",
  creditTakeWithThesis: "",
  researchMethodologyCompleted: "no",
});

function ThesisUpdateForm() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const groupId = params.id;

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedStudentCount, setSelectedStudentCount] = useState(2);
  const [literatureReviewFile, setLiteratureReviewFile] = useState<File | null>(
    null,
  );
  const [projectProposalFile, setProjectProposalFile] = useState<File | null>(
    null,
  );

  const semestersQuery = useQuery({
    queryKey: ["semesters"],
    queryFn: getSemestersApi,
  });

  const groupQuery = useQuery({
    queryKey: ["supervisor-group-details", groupId],
    queryFn: () => getSupervisorGroupByIdApi(groupId),
    enabled: Boolean(groupId),
  });

  const updateGroupMutation = useMutation({
    mutationFn: resubmitSupervisorGroupApi,
  });

  const isSubmitting = updateGroupMutation.isPending;
  const group = groupQuery.data;
  const canEdit = group?.status === "action_needed";

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
  } = useForm<ThesisFormInput, unknown, ThesisFormData>({
    resolver: zodResolver(thesisFormSchema),
    defaultValues: {
      semesterId: "",
      supervisorId: "",
      supervisorName: "",
      supervisorEmail: "",
      proposedTitle: "",
      thesisDomain: "",
      shortDescription: "",
      supervisorRemark: "",
      numberOfStudents: 2,
      students: [createEmptyStudent(), createEmptyStudent()],
      acceptTerms: true,
    },
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "students",
  });

  useEffect(() => {
    if (!group) return;

    const students = (group.students ?? []).map((student) => ({
      studentId: student.studentId ?? "",
      name: student.name ?? "",
      cgpa: String(student.cgpa ?? ""),
      primaryEmail: student.primaryEmail ?? "",
      secondaryEmail: student.secondaryEmail ?? "",
      phoneNo: student.phoneNo ?? "",
      creditCompleted: String(student.creditCompleted ?? ""),
      creditTakeWithThesis: student.creditTakeWithThesis ?? "",
      researchMethodologyCompleted:
        student.researchMethodologyCompleted ?? "no",
    }));

    const safeStudents =
      students.length >= 2
        ? students
        : [createEmptyStudent(), createEmptyStudent()];

    reset({
      semesterId: group.semesterId,
      supervisorId: group.supervisorId,
      supervisorName: group.supervisorName,
      supervisorEmail: group.supervisorEmail,
      proposedTitle: group.proposedTitle,
      thesisDomain: group.thesisDomain,
      shortDescription: group.shortDescription,
      supervisorRemark: group.supervisorRemark ?? "",
      numberOfStudents: safeStudents.length,
      students: safeStudents,
      acceptTerms: true,
    });

    setSelectedStudentCount(safeStudents.length);
    replace(safeStudents);
  }, [group, reset, replace]);

  const handleStudentCountChange = (count: number) => {
    setSelectedStudentCount(count);
    setValue("numberOfStudents", count);

    const currentStudents = getValues("students") || [];

    if (count === 2) {
      replace(currentStudents.slice(0, 2));
    }

    if (count === 3) {
      if (currentStudents.length < 3) {
        replace([...currentStudents, createEmptyStudent()]);
      } else {
        replace(currentStudents.slice(0, 3));
      }
    }

    if (count === 4) {
      if (currentStudents.length < 4) {
        const studentsToAdd: StudentFormData[] = [];

        for (let i = currentStudents.length; i < 4; i++) {
          studentsToAdd.push(createEmptyStudent());
        }

        replace([...currentStudents, ...studentsToAdd]);
      } else {
        replace(currentStudents.slice(0, 4));
      }
    }
  };

  const onSubmit = async (data: ThesisFormData) => {
    setSubmitError(null);

    if (!groupId) {
      setSubmitError("Group ID is missing.");
      return;
    }

    if (!canEdit) {
      setSubmitError("This group is not available for resubmission.");
      return;
    }

    try {
      const payload = {
        ...data,
        status: "resubmitted",
        students: data.students.map((student) => ({
          ...student,
          secondaryEmail: student.secondaryEmail?.trim() || undefined,
          creditTakeWithThesis:
            student.creditTakeWithThesis?.trim() || undefined,
        })),
      };

      await updateGroupMutation.mutateAsync({
        id: groupId,
        payload,
        literatureReviewFile: literatureReviewFile ?? undefined,
        projectProposalFile: projectProposalFile ?? undefined,
      });

      setSubmitSuccess(true);

      setTimeout(() => {
        setSubmitSuccess(false);
        router.push("/supervisor/groups");
      }, 1200);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to update thesis group. Please try again.",
      );
    }
  };

  if (groupQuery.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#050505]">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading thesis group information...
          </p>
        </div>
      </div>
    );
  }

  if (groupQuery.error || !group) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/40 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-300">
            {groupQuery.error instanceof Error
              ? groupQuery.error.message
              : "Failed to load thesis group information."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-black dark:text-white">
          Update Thesis Group
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update the requested information and resubmit the thesis group.
        </p>
      </div>

      {group.thesisManagementTeamRemark && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                Thesis Management Team Remark
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300/80">
                {group.thesisManagementTeamRemark}
              </p>
            </div>
          </div>
        </div>
      )}

      {!canEdit && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-300">
            This group cannot be edited because its current status is{" "}
            <span className="font-semibold">{group.status}</span>. Only groups
            with <span className="font-semibold">Action Needed</span> status can
            be updated and resubmitted.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-green-700 dark:text-green-300">
                  Thesis group updated and resubmitted successfully.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-700 dark:text-red-300">{submitError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#050505]">
            <h2 className="mb-6 text-xl font-semibold text-black dark:text-white">
              Supervisor Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Semester *
                </label>

                <select
                  {...register("semesterId")}
                  disabled
                  className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-black disabled:opacity-70 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                >
                  <option value="">Select semester</option>
                  {(semestersQuery.data ?? []).map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.semesterName}
                    </option>
                  ))}
                </select>

                {errors.semesterId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.semesterId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Supervisor ID *
                </label>
                <input
                  {...register("supervisorId")}
                  readOnly
                  className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-black dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Supervisor Name *
                </label>
                <input
                  {...register("supervisorName")}
                  readOnly
                  className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-black dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Supervisor Email *
                </label>
                <input
                  {...register("supervisorEmail")}
                  type="email"
                  readOnly
                  className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-black dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#050505]">
            <h2 className="mb-6 text-xl font-semibold text-black dark:text-white">
              Thesis Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Proposed Thesis Title *
                </label>
                <input
                  {...register("proposedTitle")}
                  disabled={!canEdit}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-60 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white dark:focus:ring-white"
                />
                {errors.proposedTitle && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.proposedTitle.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Thesis Domain *
                </label>
                <select
                  {...register("thesisDomain")}
                  disabled={!canEdit}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-60 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white dark:focus:ring-white"
                >
                  <option value="">Select a domain</option>
                  {thesisDomains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
                {errors.thesisDomain && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.thesisDomain.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Number of Students *
                </label>

                <div className="flex gap-4">
                  {[2, 3, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleStudentCountChange(count)}
                      className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                        selectedStudentCount === count
                          ? "bg-black text-white shadow-lg dark:bg-white dark:text-black"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20"
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Short Description *
                </label>
                <textarea
                  {...register("shortDescription")}
                  rows={4}
                  disabled={!canEdit}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-60 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white dark:focus:ring-white"
                />
                {errors.shortDescription && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.shortDescription.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Supervisor Remark *
                </label>
                <textarea
                  {...register("supervisorRemark")}
                  rows={3}
                  disabled={!canEdit}
                  placeholder="Explain what was updated before resubmitting."
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-60 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white dark:focus:ring-white"
                />
                {errors.supervisorRemark && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.supervisorRemark.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Replace Literature Review PDF
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-[#0a0a0a] dark:text-gray-300 dark:hover:bg-gray-800">
                    <Upload className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span>Browse...</span>
                    <input
                      type="file"
                      accept=".pdf"
                      disabled={!canEdit}
                      className="hidden"
                      onChange={(event) =>
                        setLiteratureReviewFile(event.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {literatureReviewFile?.name ?? "No new file chosen"}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Replace Project Proposal
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-[#0a0a0a] dark:text-gray-300 dark:hover:bg-gray-800">
                    <Upload className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span>Browse...</span>
                    <input
                      type="file"
                      accept=".pdf"
                      disabled={!canEdit}
                      className="hidden"
                      onChange={(event) =>
                        setProjectProposalFile(event.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {projectProposalFile?.name ?? "No new file chosen"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#050505]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Student Information
            </h2>
            <p className="text-sm text-gray-500">
              {fields.length} of {selectedStudentCount} students
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-lg border border-gray-200 p-4 dark:border-white/10"
              >
                <h3 className="mb-4 text-lg font-medium text-black dark:text-white">
                  Student {index + 1}
                </h3>

                <div className="space-y-4">
                  <input
                    {...register(`students.${index}.studentId`)}
                    disabled={!canEdit}
                    placeholder="Student ID"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black disabled:opacity-60 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                  />

                  <input
                    {...register(`students.${index}.name`)}
                    disabled={!canEdit}
                    placeholder="Full name"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black disabled:opacity-60 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                  />

                  <input
                    {...register(`students.${index}.cgpa`)}
                    disabled={!canEdit}
                    placeholder="CGPA"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black disabled:opacity-60 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                  />

                  <input
                    {...register(`students.${index}.primaryEmail`)}
                    disabled={!canEdit}
                    type="email"
                    placeholder="student-id@student.aiub.edu"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black disabled:opacity-60 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                  />

                  <input
                    {...register(`students.${index}.secondaryEmail`)}
                    disabled={!canEdit}
                    type="email"
                    placeholder="Secondary email"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black disabled:opacity-60 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                  />

                  <input
                    {...register(`students.${index}.phoneNo`)}
                    disabled={!canEdit}
                    placeholder="Phone No"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black disabled:opacity-60 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                  />

                  <input
                    {...register(`students.${index}.creditCompleted`)}
                    disabled={!canEdit}
                    placeholder="Credit completed"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black disabled:opacity-60 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                  />

                  <input
                    {...register(`students.${index}.creditTakeWithThesis`)}
                    disabled={!canEdit}
                    placeholder="Credit take with thesis"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black disabled:opacity-60 dark:border-white/10 dark:bg-[#0a0a0a] dark:text-white"
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Research Methodology Completed *
                    </label>

                    <div className="flex items-center gap-4">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          value="yes"
                          disabled={!canEdit}
                          {...register(
                            `students.${index}.researchMethodologyCompleted`,
                          )}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Yes
                        </span>
                      </label>

                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          value="no"
                          disabled={!canEdit}
                          {...register(
                            `students.${index}.researchMethodologyCompleted`,
                          )}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          No
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {errors.students && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              {errors.students.message}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#050505]">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              disabled={!canEdit}
              {...register("acceptTerms")}
              className="mt-1 rounded border-gray-300 dark:border-white/10"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              The AIUB CS department reserves all the rights to accept, deny or
              modify any thesis group and reassign the supervisor of any thesis
              group.
            </span>
          </label>

          {errors.acceptTerms && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {errors.acceptTerms.message}
            </p>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting || !canEdit}
              className="w-full rounded-md bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {isSubmitting ? "Resubmitting..." : "Update and Resubmit"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function ThesisUpdatePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-4" />}>
      <ThesisUpdateForm />
    </Suspense>
  );
}
