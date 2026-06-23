"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  ArrowLeft,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Hash,
  Building2,
  User,
  FileText,
  Calendar,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  revokeCertificate,
  getCertificateById,
} from "@/resources/certificate/service";
import type {
  Certificate,
  RevokeCertificateResponse,
} from "@/resources/certificate/api";

export default function RevokeCertificatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [revokeResult, setRevokeResult] =
    useState<RevokeCertificateResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch certificate details
  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setIsLoading(true);
        const data = await getCertificateById(id);
        setCertificate(data);

        // Check if already revoked
        if (data.status?.toUpperCase() === "REVOKED") {
          setError("This certificate has already been revoked.");
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
      fetchCertificate();
    }
  }, [id]);

  const handleRevoke = async () => {
    if (!revokeReason.trim()) {
      setError("Please provide a reason for revocation.");
      return;
    }

    setIsRevoking(true);
    setError(null);

    try {
      const result = await revokeCertificate(id, {
        reason: revokeReason.trim(),
      });
      setRevokeResult(result);
      setIsDialogOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to revoke certificate",
      );
    } finally {
      setIsRevoking(false);
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
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const certId = certificate?.id || certificate?.certificateId || id;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f1e8] text-slate-950 dark:bg-[#09090b] dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.09),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(202,138,4,0.12),_transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.08),_transparent_34%)]" />

      <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Link
            href={`/certificates/${id}`}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950 dark:text-white/60 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Certificate
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center gap-2 border border-red-500/20 bg-red-50/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-red-600 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur dark:border-red-500/20 dark:bg-red-950/20 dark:text-red-400">
              <ShieldAlert className="h-4 w-4" />
              Certificate Revocation
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Revoke Certificate
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600 dark:text-white/60">
              This action will permanently revoke the certificate. The
              revocation will be recorded on the blockchain and cannot be
              undone.
            </p>
          </motion.div>

          {revokeResult ? (
            // Success State
            <motion.div variants={itemVariants}>
              <Card className="border border-green-500/20 bg-green-50/90 shadow-[0_30px_120px_rgba(15,23,42,0.14)] backdrop-blur dark:border-green-500/20 dark:bg-green-950/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <div>
                      <CardTitle className="text-2xl text-green-700 dark:text-green-300">
                        Certificate Revoked Successfully
                      </CardTitle>
                      <CardDescription className="text-green-600 dark:text-green-400/70">
                        The certificate has been permanently revoked and
                        recorded on the blockchain.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1 rounded-lg border border-green-500/20 bg-white/50 p-4 dark:bg-black/20">
                      <p className="text-xs text-green-600 dark:text-green-400/70">
                        Certificate ID
                      </p>
                      <p className="font-mono text-sm font-medium">
                        {revokeResult.certificateId}
                      </p>
                    </div>
                    <div className="space-y-1 rounded-lg border border-green-500/20 bg-white/50 p-4 dark:bg-black/20">
                      <p className="text-xs text-green-600 dark:text-green-400/70">
                        Status
                      </p>
                      <p className="flex items-center gap-2 font-medium text-red-600 dark:text-red-400">
                        <XCircle className="h-4 w-4" />
                        {revokeResult.status}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1 rounded-lg border border-green-500/20 bg-white/50 p-4 dark:bg-black/20">
                      <p className="text-xs text-green-600 dark:text-green-400/70">
                        Revocation Reason
                      </p>
                      <p className="font-medium">
                        {revokeResult.revocationReason}
                      </p>
                    </div>
                    <div className="space-y-1 rounded-lg border border-green-500/20 bg-white/50 p-4 dark:bg-black/20">
                      <p className="text-xs text-green-600 dark:text-green-400/70">
                        Revoked At
                      </p>
                      <p className="flex items-center gap-2 font-medium">
                        <Clock className="h-4 w-4 text-green-600 dark:text-green-400/70" />
                        {new Date(revokeResult.revokedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 rounded-lg border border-green-500/20 bg-white/50 p-4 dark:bg-black/20">
                    <p className="text-xs text-green-600 dark:text-green-400/70">
                      Certificate Hash
                    </p>
                    <p className="break-all font-mono text-sm">
                      {revokeResult.certificateHash}
                    </p>
                  </div>

                  <div className="space-y-1 rounded-lg border border-green-500/20 bg-white/50 p-4 dark:bg-black/20">
                    <p className="text-xs text-green-600 dark:text-green-400/70">
                      Issuer Organization
                    </p>
                    <p className="flex items-center gap-2 font-medium">
                      <Building2 className="h-4 w-4 text-green-600 dark:text-green-400/70" />
                      {revokeResult.issuerOrg}
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={() =>
                        router.push(
                          `/certificates/${revokeResult.certificateId}`,
                        )
                      }
                      className="h-12 flex-1 border border-slate-950 bg-slate-950 px-5 text-sm text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-900 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
                    >
                      View Revoked Certificate
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                      className="h-12 border-slate-950/15 px-6 dark:border-white/15 dark:bg-white/[0.03]"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            // Revoke Form
            <motion.div variants={itemVariants}>
              <Card className="border border-red-500/10 bg-white/90 shadow-[0_30px_120px_rgba(15,23,42,0.14)] backdrop-blur dark:border-red-500/10 dark:bg-white/[0.04]">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold text-red-600 dark:text-red-400">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-6 w-6" />
                      Confirm Revocation
                    </span>
                  </CardTitle>
                  <CardDescription className="text-sm text-red-600/70 dark:text-red-400/70">
                    Please review the certificate details and provide a reason
                    for revocation.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Certificate Details */}
                  <div className="rounded-lg border border-red-500/10 bg-red-50/50 p-4 dark:border-red-500/10 dark:bg-red-950/10">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
                      Certificate Details
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-white/40">
                          Student Name
                        </p>
                        <p className="flex items-center gap-2 font-medium">
                          <User className="h-3 w-3 text-slate-500 dark:text-white/40" />
                          {certificate?.studentName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-white/40">
                          Certificate ID
                        </p>
                        <p className="font-mono text-sm">{certId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-white/40">
                          Exam
                        </p>
                        <p className="font-medium">{certificate?.examName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-white/40">
                          Status
                        </p>
                        <p
                          className={`font-medium ${certificate?.status?.toUpperCase() === "REVOKED" ? "text-red-600" : "text-green-600"}`}
                        >
                          {certificate?.status || "ISSUED"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-red-500/20 bg-red-50 p-4 dark:bg-red-950/20"
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

                  {/* Revoke Reason */}
                  <div className="space-y-2">
                    <label
                      htmlFor="revokeReason"
                      className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                    >
                      Revocation Reason *
                    </label>
                    <Textarea
                      id="revokeReason"
                      placeholder="Enter the reason for revoking this certificate..."
                      value={revokeReason}
                      onChange={(e) => setRevokeReason(e.target.value)}
                      disabled={
                        isRevoking ||
                        certificate?.status?.toUpperCase() === "REVOKED"
                      }
                      className="min-h-[100px] border-slate-950/10 bg-white text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] placeholder:text-slate-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-white/25"
                      required
                    />
                    <p className="text-xs text-slate-500 dark:text-white/40">
                      This reason will be recorded on the blockchain and visible
                      to anyone verifying the certificate.
                    </p>
                  </div>

                  {/* Actions */}
                  {certificate?.status?.toUpperCase() !== "REVOKED" ? (
                    <div className="flex gap-4 pt-4">
                      <AlertDialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            disabled={isRevoking || !revokeReason.trim()}
                            className="h-12 flex-1 justify-between border border-red-600 bg-red-600 px-5 text-sm text-white shadow-[0_18px_40px_rgba(220,38,38,0.3)] transition-transform hover:-translate-y-0.5 hover:bg-red-700 disabled:opacity-70 disabled:hover:translate-y-0"
                          >
                            <span>
                              {isRevoking ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Revoking...
                                </span>
                              ) : (
                                "Revoke Certificate"
                              )}
                            </span>
                            {!isRevoking && <ShieldAlert className="h-4 w-4" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                              <AlertTriangle className="h-5 w-5" />
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The certificate will
                              be permanently revoked and recorded on the
                              blockchain. Anyone verifying this certificate will
                              see that it has been revoked.
                              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-50 p-3 dark:bg-red-950/20">
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                  Certificate: {certificate?.studentName}
                                </p>
                                <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">
                                  Reason: {revokeReason}
                                </p>
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleRevoke}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {isRevoking ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Revoking...
                                </span>
                              ) : (
                                "Yes, Revoke Certificate"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/certificates/${id}`)}
                        disabled={isRevoking}
                        className="h-12 border-slate-950/15 px-6 dark:border-white/15 dark:bg-white/[0.03]"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-yellow-500/20 bg-yellow-50 p-4 dark:bg-yellow-950/20">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        This certificate has already been revoked and cannot be
                        revoked again.
                      </p>
                      <Button
                        onClick={() => router.push(`/certificates/${id}`)}
                        className="mt-4"
                      >
                        View Certificate
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
