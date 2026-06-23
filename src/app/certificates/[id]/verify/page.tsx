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
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileText,
  Clock,
  AlertCircle,
  Award,
  Calendar,
  Building2,
  GraduationCap,
  School,
  Hash,
  User,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import {
  verifyCertificateByToken,
  getCertificateById,
} from "@/resources/certificate/service";
import type {
  Certificate,
  VerifyByTokenResponse,
} from "@/resources/certificate/api";

export default function CertificateVerifyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [verificationResult, setVerificationResult] =
    useState<VerifyByTokenResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndVerify = async () => {
      try {
        setIsLoading(true);

        // First, get the certificate details to get the QR token
        const certData = await getCertificateById(id);
        setCertificate(certData);

        // If certificate has a QR token, verify it
        if (certData.qrCodeToken) {
          setIsVerifying(true);
          try {
            const result = await verifyCertificateByToken(certData.qrCodeToken);
            setVerificationResult(result);
          } catch (verifyErr) {
            setError(
              verifyErr instanceof Error
                ? verifyErr.message
                : "Verification failed",
            );
          } finally {
            setIsVerifying(false);
          }
        } else {
          setError(
            "This certificate does not have a QR token for verification.",
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load certificate",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAndVerify();
    }
  }, [id]);

  const isAuthentic = verificationResult?.result === "AUTHENTIC";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error && !certificate) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold">Certificate Not Found</h2>
          <p className="mt-2 text-gray-500">{error}</p>
          <Button onClick={() => router.push("/certificates")} className="mt-4">
            View All Certificates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f1e8] text-slate-950 dark:bg-[#09090b] dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.09),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(202,138,4,0.12),_transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.08),_transparent_34%)]" />

      <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={`/certificates/${id}`}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950 dark:text-white/60 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Certificate
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className={`border ${isAuthentic ? "border-green-500/30" : "border-red-500/30"} bg-white/90 shadow-[0_30px_120px_rgba(15,23,42,0.14)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]`}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShieldCheck
                  className={`h-8 w-8 ${isAuthentic ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                />
                <div>
                  <CardTitle className="text-2xl font-semibold">
                    Verification Result
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600 dark:text-white/55">
                    {certificate?.studentName} - {certificate?.examName}{" "}
                    {certificate?.passingYear}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Verification Status */}
              {isVerifying ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-3 text-sm text-slate-600 dark:text-white/60">
                    Verifying certificate...
                  </span>
                </div>
              ) : verificationResult ? (
                <div
                  className={`rounded-2xl border p-6 ${
                    isAuthentic
                      ? "border-green-500/30 bg-green-50 dark:bg-green-950/20"
                      : "border-red-500/30 bg-red-50 dark:bg-red-950/20"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {isAuthentic ? (
                      <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-12 w-12 text-red-600 dark:text-red-400 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h3
                        className={`text-xl font-semibold ${
                          isAuthentic
                            ? "text-green-700 dark:text-green-300"
                            : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        {isAuthentic
                          ? "✅ Authentic Certificate"
                          : "❌ Not Authentic"}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-white/60">
                        {verificationResult.message ||
                          (isAuthentic
                            ? "This certificate has been verified and is authentic."
                            : "This certificate could not be verified.")}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge
                          variant={isAuthentic ? "success" : "error"}
                          className="text-sm"
                        >
                          {verificationResult.result}
                        </Badge>
                        <span className="text-xs text-slate-500 dark:text-white/40">
                          Verified via blockchain
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-yellow-500/30 bg-yellow-50 p-6 dark:bg-yellow-950/20">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">
                        Verification Unavailable
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-white/60">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Certificate Details */}
              {certificate && (
                <div className="rounded-lg border border-slate-950/10 p-4 dark:border-white/10">
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-white/40">
                    Certificate Details
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-white/40">
                        Student Name
                      </p>
                      <p className="flex items-center gap-2 font-medium">
                        <User className="h-3 w-3 text-slate-500 dark:text-white/40" />
                        {certificate.studentName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-white/40">
                        Certificate ID
                      </p>
                      <p className="font-mono text-sm">{certificate.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-white/40">
                        Exam
                      </p>
                      <p className="flex items-center gap-2 font-medium">
                        <GraduationCap className="h-3 w-3 text-slate-500 dark:text-white/40" />
                        {certificate.examName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-white/40">
                        Result
                      </p>
                      <p className="flex items-center gap-2 font-medium">
                        <Award className="h-3 w-3 text-slate-500 dark:text-white/40" />
                        {certificate.result}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-white/40">
                        Passing Year
                      </p>
                      <p className="flex items-center gap-2 font-medium">
                        <Calendar className="h-3 w-3 text-slate-500 dark:text-white/40" />
                        {certificate.passingYear}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-white/40">
                        Board
                      </p>
                      <p className="flex items-center gap-2 font-medium">
                        <School className="h-3 w-3 text-slate-500 dark:text-white/40" />
                        {certificate.board}
                      </p>
                    </div>
                    {certificate.institute && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-slate-500 dark:text-white/40">
                          Institute
                        </p>
                        <p className="flex items-center gap-2 font-medium">
                          <Building2 className="h-3 w-3 text-slate-500 dark:text-white/40" />
                          {certificate.institute}
                        </p>
                      </div>
                    )}
                    {certificate.rollNumber && (
                      <div>
                        <p className="text-xs text-slate-500 dark:text-white/40">
                          Roll Number
                        </p>
                        <p className="flex items-center gap-2 font-medium">
                          <Hash className="h-3 w-3 text-slate-500 dark:text-white/40" />
                          {certificate.rollNumber}
                        </p>
                      </div>
                    )}
                    {certificate.registrationNumber && (
                      <div>
                        <p className="text-xs text-slate-500 dark:text-white/40">
                          Registration Number
                        </p>
                        <p className="flex items-center gap-2 font-medium">
                          <Hash className="h-3 w-3 text-slate-500 dark:text-white/40" />
                          {certificate.registrationNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  onClick={() => router.push(`/certificates/${id}`)}
                  className="h-12 flex-1 border border-slate-950 bg-slate-950 px-5 text-sm text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-900 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Certificate Details
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push("/certificates")}
                  className="h-12 border-slate-950/15 px-6 dark:border-white/15 dark:bg-white/[0.03]"
                >
                  View All Certificates
                </Button>
              </div>

              {/* Timestamp */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-white/40">
                <Clock className="h-3 w-3" />
                Verified on {new Date().toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
