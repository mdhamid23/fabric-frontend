"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  PlusCircle,
  Search,
  Eye,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  GraduationCap,
  Filter,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { getCertificates } from "@/resources/certificate/service";
import type { Certificate } from "@/resources/certificate/api";

export default function CertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<
    Certificate[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [examFilter, setExamFilter] = useState<string>("all");

  // Extract unique exams for filter
  const uniqueExams = Array.from(new Set(certificates.map((c) => c.examName)));

  useEffect(() => {
    fetchCertificates();
  }, []);

  useEffect(() => {
    filterCertificates();
  }, [certificates, searchTerm, statusFilter, examFilter]);

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCertificates();
      setCertificates(data);
      setFilteredCertificates(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load certificates",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filterCertificates = () => {
    let filtered = [...certificates];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (cert) =>
          cert.studentName.toLowerCase().includes(term) ||
          cert.rollNumber.toLowerCase().includes(term) ||
          cert.registrationNumber.toLowerCase().includes(term) ||
          cert.institute.toLowerCase().includes(term),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (cert) => cert.status.toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    // Exam filter
    if (examFilter !== "all") {
      filtered = filtered.filter((cert) => cert.examName === examFilter);
    }

    setFilteredCertificates(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "issued" || statusLower === "active") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle2 className="h-3 w-3" />
          {status}
        </span>
      );
    } else if (statusLower === "revoked") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <XCircle className="h-3 w-3" />
          {status}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Clock className="h-3 w-3" />
          {status}
        </span>
      );
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

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950 dark:text-white/60 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div
            variants={itemVariants}
            className="mb-8 flex flex-wrap items-center justify-between gap-4"
          >
            <div>
              <div className="inline-flex items-center gap-2 border border-slate-950/10 bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60">
                <GraduationCap className="h-4 w-4" />
                Certificate Management
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                All Certificates
              </h1>
              <p className="mt-2 text-base text-slate-600 dark:text-white/60">
                Manage and track all issued certificates
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => router.push("/certificates/create")}
                className="h-12 border border-slate-950 bg-slate-950 px-5 text-sm text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-900 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create
              </Button>
              <Button
                onClick={() => router.push("/certificates/create/bulk")}
                className="h-12 border border-slate-950 bg-slate-950 px-5 text-sm text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-900 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Bulk Create
              </Button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div variants={itemVariants}>
            <Card className="border border-slate-950/10 bg-white/90 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
              <CardContent className="p-6">
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/25" />
                    <Input
                      placeholder="Search by name, roll, reg..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-slate-950/10 bg-white dark:border-white/10 dark:bg-black/20"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-slate-950/10 bg-white dark:border-white/10 dark:bg-black/20">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="issued">Issued</SelectItem>
                      <SelectItem value="revoked">Revoked</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={examFilter} onValueChange={setExamFilter}>
                    <SelectTrigger className="border-slate-950/10 bg-white dark:border-white/10 dark:bg-black/20">
                      <SelectValue placeholder="Filter by exam" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Exams</SelectItem>
                      {uniqueExams.map((exam) => (
                        <SelectItem key={exam} value={exam}>
                          {exam}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={fetchCertificates}
                    className="border-slate-950/15 dark:border-white/15 dark:bg-white/[0.03]"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Count */}
          <motion.div variants={itemVariants} className="mt-4">
            <p className="text-sm text-slate-600 dark:text-white/60">
              Showing {filteredCertificates.length} of {certificates.length}{" "}
              certificates
            </p>
          </motion.div>

          {/* Table */}
          <motion.div variants={itemVariants} className="mt-6">
            <Card className="border border-slate-950/10 bg-white/90 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
              <CardContent className="p-0 overflow-x-auto">
                {isLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="flex h-64 flex-col items-center justify-center px-4">
                    <XCircle className="h-12 w-12 text-red-500" />
                    <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                    <Button onClick={fetchCertificates} className="mt-4">
                      Try Again
                    </Button>
                  </div>
                ) : filteredCertificates.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center px-4">
                    <Search className="h-12 w-12 text-slate-400 dark:text-white/25" />
                    <p className="mt-4 text-sm text-slate-600 dark:text-white/60">
                      No certificates found matching your criteria
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setExamFilter("all");
                      }}
                      className="mt-4"
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-950/10 dark:border-white/10">
                        <TableHead className="font-semibold">Student</TableHead>
                        <TableHead className="font-semibold">
                          Roll Number
                        </TableHead>
                        <TableHead className="font-semibold">
                          Registration
                        </TableHead>
                        <TableHead className="font-semibold">Exam</TableHead>
                        <TableHead className="font-semibold">Result</TableHead>
                        <TableHead className="font-semibold">Board</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCertificates.map((cert) => (
                        <TableRow
                          key={cert.id}
                          className="border-slate-950/5 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/[0.03]"
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{cert.studentName}</p>
                              <p className="text-xs text-slate-500 dark:text-white/40">
                                {cert.institute}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{cert.rollNumber}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {cert.registrationNumber}
                          </TableCell>
                          <TableCell>{cert.examName}</TableCell>
                          <TableCell>
                            <span className="font-semibold text-slate-950 dark:text-white">
                              {cert.result}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {cert.board}
                          </TableCell>
                          <TableCell>{getStatusBadge(cert.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(`/certificates/${cert.id}`)
                                }
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {cert.status.toLowerCase() !== "revoked" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    router.push(
                                      `/certificates/${cert.id}/revoke`,
                                    )
                                  }
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                                >
                                  <ShieldAlert className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
