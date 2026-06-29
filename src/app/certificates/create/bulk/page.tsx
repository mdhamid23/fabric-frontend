"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Download,
  Trash2,
  Users,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import {
  CertificatePayload,
  createBulkCertificates,
} from "@/resources/certificate/api";
import {
  createCertificate,
  createBulkCertificatess,
} from "@/resources/certificate/service";
import * as XLSX from "xlsx";

// Constants
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

interface RowError {
  row: number;
  errors: string[];
}

interface CertificateRow extends CertificatePayload {
  id: string;
  isValid: boolean;
  errors: string[];
}

export default function BulkCreateCertificatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    total: number;
    created: number;
  } | null>(null);
  const [data, setData] = useState<CertificateRow[]>([]);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: string;
  } | null>(null);

  // Validate a single row
  const validateRow = (
    row: any,
    index: number,
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check for empty fields
    const requiredFields = [
      "studentName",
      "rollNumber",
      "registrationNumber",
      "institute",
      "examName",
      "result",
      "passingYear",
      "board",
    ];

    requiredFields.forEach((field) => {
      const value = row[field]?.toString().trim() || "";
      if (!value) {
        errors.push(`${field} is required`);
      }
    });

    // Validate exam name
    if (row.examName && !EXAM_OPTIONS.includes(row.examName)) {
      errors.push(`Invalid exam name: ${row.examName}`);
    }

    // Validate board
    if (row.board && !BOARD_OPTIONS.includes(row.board)) {
      errors.push(`Invalid board: ${row.board}`);
    }

    // Validate result
    if (row.result && !RESULT_OPTIONS.includes(row.result)) {
      errors.push(`Invalid result: ${row.result}`);
    }

    // Validate passing year
    if (row.passingYear) {
      const year = parseInt(row.passingYear);
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 5) {
        errors.push(`Invalid passing year: ${row.passingYear}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Process uploaded file
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];

      if (
        !validTypes.includes(file.type) &&
        !file.name.match(/\.(xlsx|xls|csv)$/)
      ) {
        throw new Error(
          "Please upload a valid Excel or CSV file (.xlsx, .xls, .csv)",
        );
      }

      // Read file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      if (jsonData.length === 0) {
        throw new Error("The file is empty. Please provide data.");
      }

      if (jsonData.length > 1000) {
        throw new Error("Maximum 1000 rows allowed per upload.");
      }

      // Map and validate data
      const validatedData: CertificateRow[] = jsonData.map(
        (row: any, index) => {
          const validation = validateRow(row, index);
          return {
            id: `row-${index + 1}`,
            studentName: row.studentName?.toString().trim() || "",
            rollNumber: row.rollNumber?.toString().trim() || "",
            registrationNumber: row.registrationNumber?.toString().trim() || "",
            institute: row.institute?.toString().trim() || "",
            examName: row.examName?.toString().trim() || "",
            result: row.result?.toString().trim() || "",
            passingYear: row.passingYear?.toString().trim() || "",
            board: row.board?.toString().trim() || "",
            isValid: validation.isValid,
            errors: validation.errors,
          };
        },
      );

      setData(validatedData);
      setFileInfo({
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to process file. Please try again.",
      );
      setData([]);
      setFileInfo(null);
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = "";
    }
  };

  // Handle bulk create
  // In the BulkCreateCertificatePage component

  const handleBulkCreate = async () => {
    const validRows = data.filter((row) => row.isValid);

    if (validRows.length === 0) {
      setError("No valid rows found to create certificates.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payloads: CertificatePayload[] = validRows.map(
        ({
          studentName,
          rollNumber,
          registrationNumber,
          institute,
          examName,
          result,
          passingYear,
          board,
        }) => ({
          studentName,
          rollNumber,
          registrationNumber,
          institute,
          examName,
          result,
          passingYear,
          board,
        }),
      );

      console.log("Sending bulk request with payloads:", payloads);

      const result = await createBulkCertificates(payloads);

      console.log("Bulk create result:", result);

      // Validate the response
      if (!result || typeof result !== "object") {
        throw new Error("Invalid response from server");
      }

      // Update the data to reflect which ones were created/failed
      const updatedData = data.map((row) => {
        if (!row.isValid) return row;

        // Check if this row failed
        const errorResult = result.errors?.find(
          (err: any) =>
            err.rollNumber === row.rollNumber &&
            err.registrationNumber === row.registrationNumber,
        );

        if (errorResult) {
          return {
            ...row,
            isValid: false,
            errors: [errorResult.error],
            _created: false,
          };
        }

        // Check if this row was created successfully
        const successResult = result.certificates?.find(
          (cert: any) =>
            cert.studentName === row.studentName &&
            cert.rollNumber === row.rollNumber,
        );

        return {
          ...row,
          _created: !!successResult,
          _certificateId: successResult?.certificateId,
        };
      });

      setData(updatedData);

      // IMPORTANT: Set the success state based on the actual response
      if (result.created > 0 && result.failed === 0) {
        // All succeeded
        setSuccess({
          total: result.total,
          created: result.created,
          failed: result.failed,
          errors: result.errors || [],
        });
        setError(null);

        // Clear data after successful creation
        setTimeout(() => {
          setData([]);
          setFileInfo(null);
        }, 5000);
      } else if (result.created > 0 && result.failed > 0) {
        // Partial success
        setSuccess({
          total: result.total,
          created: result.created,
          failed: result.failed,
          errors: result.errors || [],
        });

        // Show error for failed ones
        const errorMessages =
          result.errors
            ?.map((err: any) => `Row ${err.index + 1}: ${err.error}`)
            .join("; ") || "";

        setError(`${result.failed} certificate(s) failed: ${errorMessages}`);
      } else if (result.created === 0 && result.failed > 0) {
        // All failed - don't set success, just show errors
        setSuccess(null);

        const errorMessages =
          result.errors
            ?.map((err: any) => `Row ${err.index + 1}: ${err.error}`)
            .join("; ") || "";

        setError(
          `All ${result.failed} certificate(s) failed: ${errorMessages}`,
        );
      } else {
        // Unexpected response
        setSuccess(null);
        setError("Unexpected response from server");
      }
    } catch (error) {
      console.error("Bulk creation error:", error);
      setSuccess(null);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create certificates. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all data
  const handleClearData = () => {
    setData([]);
    setFileInfo(null);
    setError(null);
    setSuccess(null);
  };

  // Download template
  const downloadTemplate = () => {
    const headers = [
      "studentName",
      "rollNumber",
      "registrationNumber",
      "institute",
      "examName",
      "result",
      "passingYear",
      "board",
    ];

    const sampleData = [
      {
        studentName: "Md. Hamid Uddin",
        rollNumber: "123456",
        registrationNumber: "REG-2024-001",
        institute: "Dhaka College",
        examName: "HSC",
        result: "A+",
        passingYear: "2024",
        board: "Dhaka Education Board",
      },
      {
        studentName: "Sadia Akter",
        rollNumber: "789012",
        registrationNumber: "REG-2024-002",
        institute: "Rajshahi College",
        examName: "SSC",
        result: "A",
        passingYear: "2024",
        board: "Rajshahi Education Board",
      },
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, "Certificates");
    XLSX.writeFile(wb, "certificate_template.xlsx");
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

  // Calculate statistics
  const validCount = data.filter((row) => row.isValid).length;
  const invalidCount = data.length - validCount;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f1e8] text-slate-950 dark:bg-[#09090b] dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.09),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(202,138,4,0.12),_transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.08),_transparent_34%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 border border-slate-950/10 bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60">
              <FileSpreadsheet className="h-4 w-4" />
              Bulk Certificate Creation
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Bulk Create Certificates
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600 dark:text-white/60">
              Upload an Excel file with certificate data. We&apos;ll validate
              the data and create multiple certificates at once.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6">
            <Card className="border border-slate-950/10 bg-white/90 shadow-[0_30px_120px_rgba(15,23,42,0.14)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  Upload Excel File
                </CardTitle>
                <CardDescription className="text-sm text-slate-600 dark:text-white/55">
                  Upload a file with certificate data. Download the template for
                  the correct format.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="absolute inset-0 cursor-pointer opacity-0"
                        id="file-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploading}
                        className="h-12 w-full border-slate-950/15 bg-white px-4 dark:border-white/15 dark:bg-white/[0.03]"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Choose File
                          </>
                        )}
                      </Button>
                    </div>
                    {fileInfo && (
                      <p className="mt-2 text-sm text-slate-500 dark:text-white/40">
                        {fileInfo.name} ({fileInfo.size})
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={downloadTemplate}
                    className="h-12 border-slate-950/15 px-6 dark:border-white/15 dark:bg-white/[0.03]"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

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
                    Bulk Creation Successful!
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-white/60 mt-1">
                    Created {success.created} out of {success.total}{" "}
                    certificates successfully.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {data.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border border-slate-950/10 bg-white/90 shadow-[0_30px_120px_rgba(15,23,42,0.14)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-2xl font-semibold">
                        Data Preview
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-600 dark:text-white/55">
                        {data.length} rows loaded
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-slate-600 dark:text-white/60">
                          Valid: {validCount}
                        </span>
                      </div>
                      {invalidCount > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-slate-600 dark:text-white/60">
                            Invalid: {invalidCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {invalidCount > 0 && (
                    <div className="mb-4 rounded-lg border border-yellow-500/20 bg-yellow-50 p-3 dark:bg-yellow-950/20">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-semibold text-yellow-700 dark:text-yellow-300">
                            Validation Issues Found
                          </h5>
                          <p className="text-sm text-slate-600 dark:text-white/60">
                            {invalidCount} row(s) have validation errors. Please
                            fix these before creating certificates.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Roll No.</TableHead>
                          <TableHead>Reg. No.</TableHead>
                          <TableHead>Institute</TableHead>
                          <TableHead>Exam</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead>Year</TableHead>
                          <TableHead>Board</TableHead>
                          <TableHead className="w-12">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((row, index) => (
                          <TableRow key={row.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">
                              {row.studentName || "-"}
                            </TableCell>
                            <TableCell>{row.rollNumber || "-"}</TableCell>
                            <TableCell>
                              {row.registrationNumber || "-"}
                            </TableCell>
                            <TableCell>{row.institute || "-"}</TableCell>
                            <TableCell>{row.examName || "-"}</TableCell>
                            <TableCell>{row.result || "-"}</TableCell>
                            <TableCell>{row.passingYear || "-"}</TableCell>
                            <TableCell>{row.board || "-"}</TableCell>
                            <TableCell>
                              {row.isValid ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <div className="group relative inline-block">
                                  <XCircle className="h-5 w-5 text-red-500 cursor-help" />
                                  <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 hidden w-max max-w-xs -translate-x-1/2 rounded-md bg-slate-900 px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 dark:bg-white dark:text-slate-900">
                                    {row.errors.map((err, i) => (
                                      <div key={i}>{err}</div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-4">
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={handleBulkCreate}
                        disabled={isLoading || validCount === 0}
                        className="h-12 flex-1 justify-between border border-slate-950 bg-slate-950 px-5 text-sm text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-900 disabled:opacity-70 disabled:hover:translate-y-0 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-white/90 sm:flex-initial"
                      >
                        <span>
                          {isLoading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Creating...
                            </span>
                          ) : (
                            `Create ${validCount} Certificate${validCount > 1 ? "s" : ""}`
                          )}
                        </span>
                        {!isLoading && <Users className="ml-2 h-4 w-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClearData}
                        disabled={isLoading}
                        className="h-12 border-slate-950/15 px-4 dark:border-white/15 dark:bg-white/[0.03]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
