"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  FileScan,
  QrCode,
  ShieldCheck,
  Upload,
  UserRound,
} from "lucide-react";
import QRCode from "qrcode";
import { useEffect } from "react";

type VerifyMode = "qr" | "manual";

const DEFAULT_QR_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImNlcnRpZmljYXRlSWQiOiJmNWE4MzZkMi0wYTRkLTRkYTctOWUyYi1lNzIzNjMxMTNkNGUifSwicHVycG9zZSI6InFyLWNvZGUiLCJpYXQiOjE3ODIwMjkwMzN9.hrC23edWRPGHglvzcfkPqX5F-kAMzM9FLiOe-YjyKUU";

export default function VerifyPage() {
  const [mode, setMode] = useState<VerifyMode>("qr");
  const [qrToken, setQrToken] = useState(DEFAULT_QR_TOKEN);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 24 },
    },
  };

  useEffect(() => {
    let isMounted = true;

    async function buildQr() {
      try {
        setQrError(null);
        const dataUrl = await QRCode.toDataURL(qrToken, {
          width: 280,
          margin: 1,
          errorCorrectionLevel: "M",
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        });

        if (isMounted) {
          setQrDataUrl(dataUrl);
        }
      } catch (error) {
        if (isMounted) {
          setQrDataUrl(null);
          setQrError("Unable to generate QR code from the current token.");
        }
      }
    }

    if (qrToken.trim()) {
      void buildQr();
    } else {
      setQrDataUrl(null);
      setQrError("Paste a token to generate its QR code.");
    }

    return () => {
      isMounted = false;
    };
  }, [qrToken]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f1e8] text-slate-950 dark:bg-[#09090b] dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.09),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(202,138,4,0.12),_transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.08),_transparent_34%)]" />
      <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 border border-slate-950/10 bg-white/45 shadow-[0_20px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.03]" />
      <div className="absolute bottom-[-7rem] right-[-5rem] h-80 w-80 border border-slate-950/10 bg-slate-950/5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.03]" />

      <motion.div
        className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="inline-flex items-center gap-2 border border-slate-950/10 bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60">
              <ShieldCheck className="h-4 w-4" />
              Certificate verification
            </div>

            <div className="space-y-4">
              <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-600 dark:text-white/50">
                <BadgeCheck className="h-4 w-4" />
                Dhaka Education Board
              </p>
              <h1 className="max-w-lg text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                Verify a certificate with QR or manual details.
              </h1>
              <p className="max-w-lg text-base leading-7 text-slate-600 dark:text-white/60 sm:text-lg">
                Choose the quickest option. Scan a QR code from the certificate
                or enter the record details manually for a direct lookup.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border border-slate-950/10 bg-white/75 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.04]">
                <div className="text-3xl font-semibold">2</div>
                <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                  Modes
                </div>
              </div>
              <div className="border border-slate-950/10 bg-white/75 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.04]">
                <div className="text-3xl font-semibold">3</div>
                <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                  Required fields
                </div>
              </div>
              <div className="border border-slate-950/10 bg-white/75 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.04]">
                <div className="text-3xl font-semibold">1</div>
                <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                  Result
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-white/60">
              <div className="inline-flex items-center gap-2 border border-slate-950/10 bg-white/65 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                <FileScan className="h-4 w-4" />
                Quick QR lookup
              </div>
              <div className="inline-flex items-center gap-2 border border-slate-950/10 bg-white/65 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                <UserRound className="h-4 w-4" />
                Manual record search
              </div>
              <div className="inline-flex items-center gap-2 border border-slate-950/10 bg-white/65 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                <CheckCircle2 className="h-4 w-4" />
                Board validation
              </div>
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className="lg:justify-self-end"
          >
            <Card className="w-full max-w-xl border border-slate-950/10 bg-white/90 shadow-[0_30px_120px_rgba(15,23,42,0.14)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
              <CardHeader className="space-y-2">
                <CardTitle className="text-3xl font-semibold tracking-tight">
                  Verify certificate
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-600 dark:text-white/55">
                  Select a verification mode and submit the required data.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-950/10 bg-slate-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                  <button
                    type="button"
                    onClick={() => setMode("qr")}
                    className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all ${mode === "qr" ? "border border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950" : "text-slate-600 hover:text-slate-950 dark:text-white/55 dark:hover:text-white"}`}
                  >
                    <QrCode className="h-4 w-4" />
                    QR code
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("manual")}
                    className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-all ${mode === "manual" ? "border border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950" : "text-slate-600 hover:text-slate-950 dark:text-white/55 dark:hover:text-white"}`}
                  >
                    <UserRound className="h-4 w-4" />
                    Manual input
                  </button>
                </div>

                {mode === "qr" ? (
                  <div className="space-y-5">
                    <div className="grid gap-5 ">
                      <div className="flex flex-col items-center justify-center border border-dashed border-slate-950/20 bg-white p-6 text-center dark:border-white/15 dark:bg-black/20">
                        <div className="flex h-16 w-16 items-center justify-center border border-slate-950/10 bg-slate-950 text-white dark:border-white/10 dark:bg-white dark:text-slate-950">
                          <QrCode className="h-6 w-6" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">
                          Token QR preview
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/55">
                          This QR is generated from the backend token payload
                          for the certificate.
                        </p>

                        <div className="mt-5 flex min-h-[280px] w-full items-center justify-center rounded-2xl border border-slate-950/10 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                          {qrDataUrl ? (
                            <img
                              src={qrDataUrl}
                              alt="QR code generated from certificate token"
                              className="h-64 w-64"
                            />
                          ) : (
                            <div className="text-sm text-slate-500 dark:text-white/45">
                              {qrError ?? "Generating QR code..."}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-950/10 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-white/45">
                            Backend token
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/60">
                            Paste the token from your backend table here. The QR
                            updates immediately.
                          </p>
                          <textarea
                            value={qrToken}
                            onChange={(event) => setQrToken(event.target.value)}
                            rows={10}
                            spellCheck={false}
                            className="mt-4 w-full rounded-2xl border border-slate-950/10 bg-white p-4 font-mono text-xs leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-950 focus:ring-0 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-white/25"
                          />
                        </div>

                        <div className="rounded-2xl border border-slate-950/10 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-white/45">
                            Token details
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/60">
                            In your example, the token payload contains the
                            certificate ID and the purpose flag. That makes it a
                            good candidate for a QR-backed lookup.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Button
                            type="button"
                            onClick={() => setQrToken(DEFAULT_QR_TOKEN)}
                            className="h-11 border border-slate-950 bg-slate-950 px-5 text-white dark:border-white dark:bg-white dark:text-slate-950"
                          >
                            Reset to example token
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-11 border-slate-950/15 px-5 dark:border-white/15 dark:bg-white/[0.03]"
                          >
                            <Upload className="h-4 w-4" />
                            Upload QR image
                          </Button>
                        </div>
                      </div> */}
                    </div>
                  </div>
                ) : (
                  <form className="space-y-5">
                    <div className="space-y-2">
                      <label
                        htmlFor="rollNumber"
                        className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                      >
                        Roll number
                      </label>
                      <Input
                        id="rollNumber"
                        name="rollNumber"
                        type="text"
                        placeholder="123456"
                        className="h-12 border-slate-950/10 bg-white text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] placeholder:text-slate-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-white/25"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="registrationNumber"
                        className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                      >
                        Registration number
                      </label>
                      <Input
                        id="registrationNumber"
                        name="registrationNumber"
                        type="text"
                        placeholder="REG-2024-002"
                        className="h-12 border-slate-950/10 bg-white text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] placeholder:text-slate-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-white/25"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="passingYear"
                        className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                      >
                        Passing year
                      </label>
                      <Input
                        id="passingYear"
                        name="passingYear"
                        type="text"
                        inputMode="numeric"
                        placeholder="2024"
                        className="h-12 border-slate-950/10 bg-white text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] placeholder:text-slate-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-white/25"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="h-12 w-full justify-between border border-slate-950 bg-slate-950 px-5 text-sm text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-900 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
                    >
                      <span>Verify manually</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                )}

                <div className="flex items-center justify-between gap-4 text-sm text-slate-600 dark:text-white/55">
                  <span>Want to go back first?</span>
                  <Link
                    href="/"
                    className="font-medium text-slate-950 underline decoration-slate-950/30 underline-offset-4 hover:decoration-slate-950 dark:text-white dark:decoration-white/30"
                  >
                    Back to home
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </motion.div>
    </main>
  );
}
