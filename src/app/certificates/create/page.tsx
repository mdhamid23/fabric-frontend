"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  ArrowLeft,
  Save,
  User,
  Hash,
  Building2,
  GraduationCap,
  Award,
  Calendar,
  School,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { CertificatePayload } from "@/resources/certificate/api";
import { createCertificate } from "@/resources/certificate/service";

const EXAM_OPTIONS = [
  "SSC",
  "HSC",
  "JSC",
  "PSC",
  "Bachelor's",
  "Master's",
  "Diploma",
  "Other",
];

const BOARD_OPTIONS = [
  "Dhaka Education Board",
  "Rajshahi Education Board",
  "Comilla Education Board",
  "Jessore Education Board",
  "Chittagong Education Board",
  "Barisal Education Board",
  "Sylhet Education Board",
  "Dinajpur Education Board",
  "Mymensingh Education Board",
  "Other",
];

const RESULT_OPTIONS = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D", "F"];

export default function CreateCertificatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    id: string;
    studentName: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState<CertificatePayload>({
    studentName: "",
    rollNumber: "",
    registrationNumber: "",
    institute: "",
    examName: "",
    result: "",
    passingYear: "",
    board: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setError(null);
    setSuccess(null);

    // Validate all fields
    const requiredFields: (keyof CertificatePayload)[] = [
      "studentName",
      "rollNumber",
      "registrationNumber",
      "institute",
      "examName",
      "result",
      "passingYear",
      "board",
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field]?.trim(),
    );

    if (missingFields.length > 0) {
      setError(
        `Please fill in all required fields: ${missingFields.join(", ")}`,
      );
      return;
    }

    // Validate passing year
    const year = parseInt(formData.passingYear);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 5) {
      setError("Please enter a valid passing year.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createCertificate(formData);

      setSuccess({
        id: "",
        studentName: result.studentName,
      });

      // Reset form
      setFormData({
        studentName: "",
        rollNumber: "",
        registrationNumber: "",
        institute: "",
        examName: "",
        result: "",
        passingYear: "",
        board: "",
      });

      // Auto redirect after 3 seconds
      //   setTimeout(() => {
      //     router.push(`/certificates/${result.id}`);
      //   }, 3000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create certificate. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 24 },
    },
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f1e8] text-slate-950 dark:bg-[#09090b] dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.09),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(202,138,4,0.12),_transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.08),_transparent_34%)]" />

      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 border border-slate-950/10 bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60">
              <GraduationCap className="h-4 w-4" />
              Certificate Management
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Create New Certificate
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600 dark:text-white/60">
              Fill in the details below to create a new educational certificate.
              All fields are required.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border border-slate-950/10 bg-white/90 shadow-[0_30px_120px_rgba(15,23,42,0.14)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  Certificate Details
                </CardTitle>
                <CardDescription className="text-sm text-slate-600 dark:text-white/55">
                  Enter the student&apos;s information and certificate details
                </CardDescription>
              </CardHeader>

              <CardContent>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 rounded-2xl border border-red-500/20 bg-red-50 p-4 dark:bg-red-950/20"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-700 dark:text-red-300">
                          Error
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-white/60 mt-1">
                          {error}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 rounded-2xl border border-green-500/20 bg-green-50 p-4 dark:bg-green-950/20"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-700 dark:text-green-300">
                          Certificate Created Successfully!
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-white/60 mt-1">
                          Certificate for {success.studentName} has been
                          created. Redirecting to view...
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Student Name */}
                    <div className="space-y-2 md:col-span-2">
                      <label
                        htmlFor="studentName"
                        className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                      >
                        Student Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/25" />
                        <Input
                          id="studentName"
                          name="studentName"
                          type="text"
                          placeholder="Md. Hamid Uddin"
                          value={formData.studentName}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="h-12 border-slate-950/10 bg-white pl-10 text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] placeholder:text-slate-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-white/25"
                          required
                        />
                      </div>
                    </div>

                    {/* Roll Number */}
                    <div className="space-y-2">
                      <label
                        htmlFor="rollNumber"
                        className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                      >
                        Roll Number *
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/25" />
                        <Input
                          id="rollNumber"
                          name="rollNumber"
                          type="text"
                          placeholder="123456"
                          value={formData.rollNumber}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="h-12 border-slate-950/10 bg-white pl-10 text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] placeholder:text-slate-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-white/25"
                          required
                        />
                      </div>
                    </div>

                    {/* Registration Number */}
                    <div className="space-y-2">
                      <label
                        htmlFor="registrationNumber"
                        className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                      >
                        Registration Number *
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/25" />
                        <Input
                          id="registrationNumber"
                          name="registrationNumber"
                          type="text"
                          placeholder="REG-2024-002"
                          value={formData.registrationNumber}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="h-12 border-slate-950/10 bg-white pl-10 text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] placeholder:text-slate-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-white/25"
                          required
                        />
                      </div>
                    </div>

                    {/* Institute */}
                    <div className="space-y-2 md:col-span-2">
                      <label
                        htmlFor="institute"
                        className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                      >
                        Institute *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/25" />
                        <Input
                          id="institute"
                          name="institute"
                          type="text"
                          placeholder="Dhaka College"
                          value={formData.institute}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="h-12 border-slate-950/10 bg-white pl-10 text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] placeholder:text-slate-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-white/25"
                          required
                        />
                      </div>
                    </div>

                    {/* Exam Name */}
                    <div className="space-y-2">
                      <label
                        htmlFor="examName"
                        className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                      >
                        Exam Name *
                      </label>
                      <Select
                        value={formData.examName}
                        onValueChange={(value) =>
                          handleSelectChange("examName", value)
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-12 border-slate-950/10 bg-white text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-black/20">
                          <SelectValue placeholder="Select exam" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXAM_OPTIONS.map((exam) => (
                            <SelectItem key={exam} value={exam}>
                              {exam}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Result */}
                    <div className="space-y-2">
                      <label
                        htmlFor="result"
                        className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                      >
                        Result *
                      </label>
                      <Select
                        value={formData.result}
                        onValueChange={(value) =>
                          handleSelectChange("result", value)
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-12 border-slate-950/10 bg-white text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-black/20">
                          <SelectValue placeholder="Select result" />
                        </SelectTrigger>
                        <SelectContent>
                          {RESULT_OPTIONS.map((result) => (
                            <SelectItem key={result} value={result}>
                              {result}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Passing Year */}
                    <div className="space-y-2">
                      <label
                        htmlFor="passingYear"
                        className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                      >
                        Passing Year *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/25" />
                        <Input
                          id="passingYear"
                          name="passingYear"
                          type="text"
                          inputMode="numeric"
                          placeholder="2024"
                          value={formData.passingYear}
                          onChange={handleChange}
                          disabled={isLoading}
                          className="h-12 border-slate-950/10 bg-white pl-10 text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] placeholder:text-slate-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-white/25"
                          required
                        />
                      </div>
                    </div>

                    {/* Board */}
                    <div className="space-y-2">
                      <label
                        htmlFor="board"
                        className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                      >
                        Board *
                      </label>
                      <Select
                        value={formData.board}
                        onValueChange={(value) =>
                          handleSelectChange("board", value)
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger className="h-12 border-slate-950/10 bg-white text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-black/20">
                          <SelectValue placeholder="Select board" />
                        </SelectTrigger>
                        <SelectContent>
                          {BOARD_OPTIONS.map((board) => (
                            <SelectItem key={board} value={board}>
                              {board}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-12 flex-1 justify-between border border-slate-950 bg-slate-950 px-5 text-sm text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-900 disabled:opacity-70 disabled:hover:translate-y-0 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
                    >
                      <span>
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Creating...
                          </span>
                        ) : (
                          "Create Certificate"
                        )}
                      </span>
                      {!isLoading && <Save className="h-4 w-4" />}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                      disabled={isLoading}
                      className="h-12 border-slate-950/15 px-6 dark:border-white/15 dark:bg-white/[0.03]"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
