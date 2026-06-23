"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  BadgeCheck,
  QrCode,
  Clock,
  User,
  Hash,
  Building2,
  GraduationCap,
  Award,
  Calendar,
  School,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  FileText,
  Link2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { getCertificateById } from "@/resources/certificate/service";
import type { Certificate } from "@/resources/certificate/api";

export default function CertificateDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params.id as string;

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setIsLoading(true);
        const data = await getCertificateById(id);
        setCertificate(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load certificate",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCertificate();
    }
  }, [id]);

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower === "issued" || statusLower === "active") {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      );
    } else if (statusLower === "revoked") {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">
          <XCircle className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Clock className="h-3 w-3 mr-1" />
          {status || "Unknown"}
        </Badge>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold">Certificate Not Found</h2>
          <p className="mt-2 text-gray-500">
            {error || "The certificate you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.push("/certificates")} className="mt-4">
            View All Certificates
          </Button>
        </div>
      </div>
    );
  }

  const isRevoked = certificate.status?.toLowerCase() === "revoked";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f1e8] text-slate-950 dark:bg-[#09090b] dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.09),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(202,138,4,0.12),_transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.08),_transparent_34%)]" />

      <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/certificates"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950 dark:text-white/60 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Certificates
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className={`border ${isRevoked ? "border-red-500/20" : "border-slate-950/10"} bg-white/90 shadow-[0_30px_120px_rgba(15,23,42,0.14)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]`}
          >
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl font-semibold tracking-tight">
                    Certificate Details
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600 dark:text-white/55">
                    {certificate.studentName} - {certificate.examName}{" "}
                    {certificate.passingYear}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(certificate.status)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Certificate ID */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 rounded-lg border border-slate-950/10 p-4 dark:border-white/10">
                  <p className="text-xs text-slate-500 dark:text-white/40">
                    Certificate ID
                  </p>
                  <p className="font-mono text-sm font-medium">
                    {certificate.id}
                  </p>
                </div>

                {certificate.createdAt && (
                  <div className="space-y-1 rounded-lg border border-slate-950/10 p-4 dark:border-white/10">
                    <p className="text-xs text-slate-500 dark:text-white/40">
                      Created At
                    </p>
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4 text-slate-500 dark:text-white/40" />
                      {new Date(certificate.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Student Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-white/40">
                    Student Name
                  </p>
                  <p className="flex items-center gap-2 font-medium">
                    <User className="h-4 w-4 text-slate-500 dark:text-white/40" />
                    {certificate.studentName}
                  </p>
                </div>

                {certificate.institute && (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 dark:text-white/40">
                      Institute
                    </p>
                    <p className="flex items-center gap-2 font-medium">
                      <Building2 className="h-4 w-4 text-slate-500 dark:text-white/40" />
                      {certificate.institute}
                    </p>
                  </div>
                )}
              </div>

              {/* Roll & Registration */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-white/40">
                    Roll Number
                  </p>
                  <p className="flex items-center gap-2 font-medium">
                    <Hash className="h-4 w-4 text-slate-500 dark:text-white/40" />
                    {certificate.rollNumber}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-white/40">
                    Registration Number
                  </p>
                  <p className="flex items-center gap-2 font-medium">
                    <Hash className="h-4 w-4 text-slate-500 dark:text-white/40" />
                    {certificate.registrationNumber}
                  </p>
                </div>
              </div>

              {/* Exam Details */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-white/40">
                    Exam
                  </p>
                  <p className="flex items-center gap-2 font-medium">
                    <GraduationCap className="h-4 w-4 text-slate-500 dark:text-white/40" />
                    {certificate.examName}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-white/40">
                    Result
                  </p>
                  <p className="flex items-center gap-2 font-medium">
                    <Award className="h-4 w-4 text-slate-500 dark:text-white/40" />
                    {certificate.result}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-white/40">
                    Passing Year
                  </p>
                  <p className="flex items-center gap-2 font-medium">
                    <Calendar className="h-4 w-4 text-slate-500 dark:text-white/40" />
                    {certificate.passingYear}
                  </p>
                </div>
              </div>

              {/* Board */}
              <div className="space-y-1">
                <p className="text-xs text-slate-500 dark:text-white/40">
                  Board
                </p>
                <p className="flex items-center gap-2 font-medium">
                  <School className="h-4 w-4 text-slate-500 dark:text-white/40" />
                  {certificate.board}
                </p>
              </div>

              {/* QR Code Token */}
              {certificate.qrCodeToken && (
                <div className="rounded-lg border border-slate-950/10 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <QrCode className="h-4 w-4 text-slate-500 dark:text-white/40" />
                    QR Code Token
                  </p>
                  <p className="mt-2 break-all font-mono text-xs text-slate-500 dark:text-white/40">
                    {certificate.qrCodeToken}
                  </p>
                </div>
              )}

              {/* Revocation Info */}
              {isRevoked && certificate.revokedAt && (
                <div className="rounded-lg border border-red-500/20 bg-red-50 p-4 dark:bg-red-950/20">
                  <h4 className="mb-3 font-semibold text-red-700 dark:text-red-300">
                    Revocation Information
                  </h4>
                  <div className="space-y-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-red-600 dark:text-red-400/70">
                          Revoked At
                        </p>
                        <p className="font-medium">
                          {new Date(certificate.revokedAt).toLocaleString()}
                        </p>
                      </div>
                      {certificate.revokedBy && (
                        <div>
                          <p className="text-xs text-red-600 dark:text-red-400/70">
                            Revoked By
                          </p>
                          <p className="font-medium">{certificate.revokedBy}</p>
                        </div>
                      )}
                    </div>
                    {certificate.revocationReason && (
                      <div>
                        <p className="text-xs text-red-600 dark:text-red-400/70">
                          Reason
                        </p>
                        <p className="font-medium">
                          {certificate.revocationReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Blockchain Info */}
              {(certificate.blockchainTxId ||
                certificate.blockchainBlockNumber) && (
                <div className="rounded-lg border border-slate-950/10 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <h4 className="mb-3 font-semibold">Blockchain Information</h4>
                  <div className="space-y-2">
                    {certificate.blockchainTxId && (
                      <div>
                        <p className="text-xs text-slate-500 dark:text-white/40">
                          Transaction ID
                        </p>
                        <p className="break-all font-mono text-sm">
                          {certificate.blockchainTxId}
                        </p>
                      </div>
                    )}
                    {certificate.blockchainBlockNumber && (
                      <div>
                        <p className="text-xs text-slate-500 dark:text-white/40">
                          Block Number
                        </p>
                        <p className="font-medium">
                          {certificate.blockchainBlockNumber}
                        </p>
                      </div>
                    )}
                    {certificate.blockchainTimestamp && (
                      <div>
                        <p className="text-xs text-slate-500 dark:text-white/40">
                          Blockchain Timestamp
                        </p>
                        <p className="font-medium">
                          {new Date(
                            certificate.blockchainTimestamp,
                          ).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  onClick={() =>
                    router.push(`/certificates/${certificate.id}/verify`)
                  }
                  className="h-12 flex-1 border border-slate-950 bg-slate-950 px-5 text-sm text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-900 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Verify Certificate
                </Button>

                {!isRevoked && (
                  <Button
                    onClick={() =>
                      router.push(`/certificates/${certificate.id}/revoke`)
                    }
                    className="h-12 flex-1 border border-red-600 bg-red-600 px-5 text-sm text-white shadow-[0_18px_40px_rgba(220,38,38,0.3)] transition-transform hover:-translate-y-0.5 hover:bg-red-700 dark:border-red-600 dark:bg-red-600"
                  >
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    Revoke Certificate
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => router.push("/certificates")}
                  className="h-12 border-slate-950/15 px-6 dark:border-white/15 dark:bg-white/[0.03]"
                >
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
