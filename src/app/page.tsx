"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ShieldCheck,
  BadgeCheck,
  ScanSearch,
  FileSearch,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function Home() {
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
        <div className="grid w-full gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <motion.section
            variants={itemVariants}
            className="max-w-2xl space-y-8"
          >
            <div className="inline-flex items-center gap-2 border border-slate-950/10 bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60">
              <ShieldCheck className="h-4 w-4" />
              Dhaka Education Board
            </div>

            <div className="space-y-5">
              <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-600 dark:text-white/50">
                <Building2 className="h-4 w-4" />
                Certificate verification portal
              </p>
              <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                Verify academic certificates in seconds.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-white/60 sm:text-lg">
                Search issued records, validate certificate details, and confirm
                authenticity through a clean board-managed verification flow.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                asChild
                className="h-12 border border-slate-950 bg-slate-950 px-6 text-sm text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-900 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
              >
                <Link href="/login">
                  <span>Get started and login</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 border border-slate-950/15 px-6 text-sm shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/15 dark:bg-white/[0.03]"
              >
                <Link href="/verify">
                  <span>Verify certificate</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <div className="text-sm text-slate-600 dark:text-white/55">
                Use the verification portal to access protected record lookup.
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border border-slate-950/10 bg-white/75 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.04]">
                <div className="text-3xl font-semibold">24/7</div>
                <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                  Lookup
                </div>
              </div>
              <div className="border border-slate-950/10 bg-white/75 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.04]">
                <div className="text-3xl font-semibold">1</div>
                <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                  Record match
                </div>
              </div>
              <div className="border border-slate-950/10 bg-white/75 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.04]">
                <div className="text-3xl font-semibold">100%</div>
                <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                  Authenticity check
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-white/60">
              <div className="inline-flex items-center gap-2 border border-slate-950/10 bg-white/65 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                <BadgeCheck className="h-4 w-4" />
                Issued by the board
              </div>
              <div className="inline-flex items-center gap-2 border border-slate-950/10 bg-white/65 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                <ScanSearch className="h-4 w-4" />
                Instant search
              </div>
              <div className="inline-flex items-center gap-2 border border-slate-950/10 bg-white/65 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                <ShieldAlert className="h-4 w-4" />
                Fraud detection ready
              </div>
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className="lg:justify-self-end"
          >
            <div className="relative w-full max-w-md border border-slate-950/10 bg-white/88 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.14)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-slate-950 via-amber-600 to-cyan-500 dark:from-amber-400 dark:via-amber-500 dark:to-cyan-400" />

              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-white/45">
                  Quick verification
                </p>
                <h2 className="text-3xl font-semibold tracking-tight">
                  Check from the home page
                </h2>
                <p className="text-sm leading-6 text-slate-600 dark:text-white/55">
                  Enter the certificate details here for a fast lookup, or open
                  the full verification page for QR scanning.
                </p>
              </div>

              <form className="mt-8 space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="home-rollNumber"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                  >
                    Roll number
                  </label>
                  <Input
                    id="home-rollNumber"
                    name="rollNumber"
                    type="text"
                    placeholder="123456"
                    className="h-12 border-slate-950/10 bg-white text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] placeholder:text-slate-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-white/25"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="home-registrationNumber"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                  >
                    Registration number
                  </label>
                  <Input
                    id="home-registrationNumber"
                    name="registrationNumber"
                    type="text"
                    placeholder="REG-2024-002"
                    className="h-12 border-slate-950/10 bg-white text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] placeholder:text-slate-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-white/25"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="home-passingYear"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                  >
                    Passing year
                  </label>
                  <Input
                    id="home-passingYear"
                    name="passingYear"
                    type="text"
                    inputMode="numeric"
                    placeholder="2024"
                    className="h-12 border-slate-950/10 bg-white text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] placeholder:text-slate-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-white/25"
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    type="submit"
                    className="h-12 flex-1 justify-between border border-slate-950 bg-slate-950 px-5 text-sm text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-900 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
                  >
                    <span>Check now</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 border border-slate-950/15 px-5 text-sm shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/15 dark:bg-white/[0.03]"
                  >
                    <Link href="/verify">
                      <span>Use QR page</span>
                    </Link>
                  </Button>
                </div>
              </form>

              <div className="mt-6 border border-slate-950/10 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-white/45">
                      Full verification
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-white/60">
                      Use the full verification page when you need QR scanning
                      or a dedicated lookup flow.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </main>
  );
}
