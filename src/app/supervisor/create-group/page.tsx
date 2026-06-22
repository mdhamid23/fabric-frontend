"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Upload, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSupervisorGroupApi } from "@/resources/thesis-group/api";
import { getSemestersApi } from "@/resources/semester/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

// Schema definitions
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
  secondaryEmail: z.string().email("Invalid email address").optional(),
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
type AuthUserProfile = {
  id: number;
  username: string;
  facultyId?: string | null;
  name?: string | null;
  email?: string | null;
  designation?: string | null;
  roomNo?: string | null;
  phoneNo?: string | null;
  profileCompleted?: boolean;
};

type AuthUser = {
  id: number;
  username: string;
  email: string;
  roles: string[];
  profile?: AuthUserProfile | null;
};

type AuthCookieResponse = {
  authenticated: boolean;
  user?: AuthUser;
};

async function getCurrentAuthUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/cookie", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as AuthCookieResponse;

  if (!data.authenticated || !data.user) {
    return null;
  }

  return data.user;
}

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

function ThesisCreationForm() {
  const router = useRouter();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedStudentCount, setSelectedStudentCount] = useState(2);
  const [literatureReviewFile, setLiteratureReviewFile] = useState<File | null>(
    null,
  );
  const [projectProposalFile, setProjectProposalFile] = useState<File | null>(
    null,
  );
  const authUserQuery = useQuery({
    queryKey: ["current-auth-user"],
    queryFn: getCurrentAuthUser,
  });

  const semestersQuery = useQuery({
    queryKey: ["semesters"],
    queryFn: getSemestersApi,
  });

  const createGroupMutation = useMutation({
    mutationFn: createSupervisorGroupApi,
  });

  const isSubmitting = createGroupMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
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
      numberOfStudents: 2,
      students: [createEmptyStudent(), createEmptyStudent()],
      acceptTerms: false,
    },
  });

  useEffect(() => {
    const user = authUserQuery.data;

    if (!user) {
      return;
    }

    setValue(
      "supervisorId",
      user.profile?.facultyId || user.username || String(user.id),
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );

    setValue("supervisorName", user.profile?.name || user.username, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("supervisorEmail", user.profile?.email || user.email, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [authUserQuery.data, setValue]);

  useEffect(() => {
    if (!getValues("semesterId") && semestersQuery.data?.length) {
      setValue("semesterId", semestersQuery.data[0].id);
    }
  }, [getValues, semestersQuery.data, setValue]);

  const { fields, replace } = useFieldArray({
    control,
    name: "students",
  });

  const handleStudentCountChange = (count: number) => {
    setSelectedStudentCount(count);
    setValue("numberOfStudents", count);

    const currentStudents = getValues("students") || [];

    if (count === 2) {
      // Keep first 2 students
      const newStudents = currentStudents.slice(0, 2);
      replace(newStudents);
    } else if (count === 3) {
      if (currentStudents.length < 3) {
        // Add a new student
        replace([...currentStudents, createEmptyStudent()]);
      } else {
        // Keep first 3 students
        replace(currentStudents.slice(0, 3));
      }
    } else if (count === 4) {
      if (currentStudents.length < 4) {
        // Add new students
        const studentsToAdd: StudentFormData[] = [];
        for (let i = currentStudents.length; i < 4; i++) {
          studentsToAdd.push(createEmptyStudent());
        }
        replace([...currentStudents, ...studentsToAdd]);
      } else {
        // Keep first 4 students
        replace(currentStudents.slice(0, 4));
      }
    }
  };

  const onSubmit = async (data: ThesisFormData) => {
    setSubmitError(null);

    try {
      const payload = {
        ...data,
        students: data.students.map((student) => ({
          ...student,
          secondaryEmail: student.secondaryEmail?.trim() || undefined,
        })),
      };

      await createGroupMutation.mutateAsync({
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
          : "Failed to create thesis group. Please try again.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
          Thesis Creation Form
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Fill out the form below to submit your thesis proposal
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Success Message */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-green-700 dark:text-green-300">
                  Thesis proposal submitted successfully!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {submitError && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <p className="text-red-700 dark:text-red-300">{submitError}</p>
          </div>
        )}

        {/* Supervisor and Thesis Information - Side by Side on Large Screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Supervisor Information */}
          <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#050505] p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-6">
              Supervisor Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Semester *
                </label>
                <select
                  {...register("semesterId")}
                  disabled={semestersQuery.isLoading}
                  className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-60"
                >
                  <option value="">
                    {semestersQuery.isLoading
                      ? "Loading semesters..."
                      : "Select semester"}
                  </option>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supervisor ID *
                </label>
                <input
                  {...register("supervisorId")}
                  className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  placeholder="e.g., S001"
                  readOnly
                />
                {errors.supervisorId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.supervisorId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supervisor Name *
                </label>
                <input
                  {...register("supervisorName")}
                  className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  placeholder="Dr. John Doe"
                  readOnly
                />
                {errors.supervisorName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.supervisorName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supervisor Email *
                </label>
                <input
                  {...register("supervisorEmail")}
                  type="email"
                  className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  placeholder="username@aiub.edu"
                  readOnly
                />
                {errors.supervisorEmail && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.supervisorEmail.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Thesis Information */}
          <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#050505] p-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-6">
              Thesis Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Proposed Thesis Title *
                </label>
                <input
                  {...register("proposedTitle")}
                  className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  placeholder="Enter your thesis title"
                />
                {errors.proposedTitle && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.proposedTitle.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thesis Domain *
                </label>
                <select
                  {...register("thesisDomain")}
                  className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Students *
                </label>
                <div className="flex gap-4">
                  {[2, 3, 4].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleStudentCountChange(count)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                        selectedStudentCount === count
                          ? "bg-black dark:bg-white text-white dark:text-black shadow-lg"
                          : "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20"
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Short Description *
                </label>
                <textarea
                  {...register("shortDescription")}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  placeholder="Provide a brief description of your thesis..."
                />
                {errors.shortDescription && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.shortDescription.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Literature Review (PDF)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <Upload className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span>Browse...</span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(event) =>
                          setLiteratureReviewFile(
                            event.target.files?.[0] ?? null,
                          )
                        }
                      />
                    </label>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {literatureReviewFile?.name ?? "No file chosen"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Proposal
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0a0a0a] px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <Upload className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span>Browse...</span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(event) =>
                          setProjectProposalFile(
                            event.target.files?.[0] ?? null,
                          )
                        }
                      />
                    </label>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {projectProposalFile?.name ?? "No file chosen"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Information - 2 per row on large screens */}
        <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#050505] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Student Information
            </h2>
            <p className="text-sm text-gray-500">
              {fields.length} of {selectedStudentCount} students
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative rounded-lg border border-gray-200 dark:border-white/10 p-4"
              >
                <h3 className="text-lg font-medium text-black dark:text-white mb-4">
                  Student {index + 1}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Student ID *
                    </label>
                    <input
                      {...register(`students.${index}.studentId`)}
                      className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      placeholder="e.g., 22-12345-1"
                    />
                    {errors.students?.[index]?.studentId && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.students[index]?.studentId?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name *
                    </label>
                    <input
                      {...register(`students.${index}.name`)}
                      className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      placeholder="Full name"
                    />
                    {errors.students?.[index]?.name && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.students[index]?.name?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      CGPA *
                    </label>
                    <input
                      {...register(`students.${index}.cgpa`)}
                      className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      placeholder="e.g., 3.75"
                    />
                    {errors.students?.[index]?.cgpa && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.students[index]?.cgpa?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Primary Email * (@student.aiub.edu)
                    </label>
                    <input
                      {...register(`students.${index}.primaryEmail`)}
                      type="email"
                      className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      placeholder="student-id@student.aiub.edu"
                    />
                    {errors.students?.[index]?.primaryEmail && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.students[index]?.primaryEmail?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Secondary Email (Optional)
                    </label>
                    <input
                      {...register(`students.${index}.secondaryEmail`)}
                      type="email"
                      className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      placeholder="personal.email@example.com"
                    />
                    {errors.students?.[index]?.secondaryEmail && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.students[index]?.secondaryEmail?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone No *
                    </label>
                    <input
                      {...register(`students.${index}.phoneNo`)}
                      className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      placeholder="+8801XXXXXXXXX"
                    />
                    {errors.students?.[index]?.phoneNo && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.students[index]?.phoneNo?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Credit Completed *
                    </label>
                    <input
                      {...register(`students.${index}.creditCompleted`)}
                      className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      placeholder="e.g., 120"
                    />
                    {errors.students?.[index]?.creditCompleted && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.students[index]?.creditCompleted?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Credit Take with Thesis in next semester registration
                    </label>
                    <input
                      {...register(`students.${index}.creditTakeWithThesis`)}
                      className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-3 py-2 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      placeholder="e.g., 3 credits"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Research Methodology Completed *
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="yes"
                          {...register(
                            `students.${index}.researchMethodologyCompleted`,
                          )}
                          className="rounded border-gray-300 dark:border-white/10"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Yes
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="no"
                          {...register(
                            `students.${index}.researchMethodologyCompleted`,
                          )}
                          className="rounded border-gray-300 dark:border-white/10"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          No
                        </span>
                      </label>
                    </div>
                    {errors.students?.[index]?.researchMethodologyCompleted && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {
                          errors.students[index]?.researchMethodologyCompleted
                            ?.message
                        }
                      </p>
                    )}
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

        {/* Terms and Submit */}
        <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#050505] p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("acceptTerms")}
              className="mt-1 rounded border-gray-300 dark:border-white/10"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              The AIUB CS department reserves all the rights to accept, deny or
              modify any thesis group and reassign the supervisor of any thesis
              group
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
              disabled={isSubmitting}
              className="w-full rounded-md bg-black dark:bg-white px-6 py-3 text-white dark:text-black font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Thesis Proposal"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function ThesisCreationPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-4" />}>
      <ThesisCreationForm />
    </Suspense>
  );
}
