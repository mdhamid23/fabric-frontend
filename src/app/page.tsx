"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
  UserRound,
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
    <main className="relative min-h-screen overflow-hidden bg-[#f3efe7] text-slate-950 dark:bg-[#09090b] dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(217,119,6,0.12),_transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(234,179,8,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.08),_transparent_34%)]" />
      <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 border border-slate-950/10 bg-white/40 shadow-[0_20px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.03]" />
      <div className="absolute bottom-[-7rem] right-[-5rem] h-80 w-80 border border-slate-950/10 bg-slate-950/5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.03]" />

      <motion.div
        className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.section
            variants={itemVariants}
            className="max-w-2xl space-y-8"
          >
            <div className="inline-flex items-center gap-2 border border-slate-950/10 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60">
              <ShieldCheck className="h-4 w-4" />
              Secure academic access
            </div>

            <div className="space-y-5">
              <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-600 dark:text-white/50">
                <Building2 className="h-4 w-4" />
                AIUB FST Platform
              </p>
              <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                Sign in to manage your thesis workspace.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-white/60 sm:text-lg">
                Use your username and password to access dashboards, documents,
                approvals, and supervisor tools from a single secure entry
                point.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border border-slate-950/10 bg-white/70 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.04]">
                <div className="text-3xl font-semibold">24/7</div>
                <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                  Access
                </div>
              </div>
              <div className="border border-slate-950/10 bg-white/70 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.04]">
                <div className="text-3xl font-semibold">1</div>
                <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                  Login
                </div>
              </div>
              <div className="border border-slate-950/10 bg-white/70 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.04]">
                <div className="text-3xl font-semibold">3</div>
                <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                  Roles
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-white/60">
              <div className="inline-flex items-center gap-2 border border-slate-950/10 bg-white/60 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                <CheckCircle2 className="h-4 w-4" />
                Thesis records
              </div>
              <div className="inline-flex items-center gap-2 border border-slate-950/10 bg-white/60 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                <Fingerprint className="h-4 w-4" />
                Secure session
              </div>
              <div className="inline-flex items-center gap-2 border border-slate-950/10 bg-white/60 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
                <LockKeyhole className="h-4 w-4" />
                Protected access
              </div>
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className="lg:justify-self-end"
          >
            <div className="relative w-full max-w-md border border-slate-950/10 bg-white/85 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.14)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-slate-950 via-amber-600 to-emerald-500 dark:from-amber-400 dark:via-amber-500 dark:to-cyan-400" />

              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-white/45">
                  Welcome back
                </p>
                <h2 className="text-3xl font-semibold tracking-tight">
                  Sign in to continue
                </h2>
                <p className="text-sm leading-6 text-slate-600 dark:text-white/55">
                  Enter your username and password to pick up where you left
                  off.
                </p>
              </div>

              <form className="mt-8 space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-white/35" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter your username"
                      autoComplete="username"
                      className="h-12 border-slate-950/10 bg-white pl-10 text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] placeholder:text-slate-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-white/25"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-white/35" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="h-12 border-slate-950/10 bg-white pl-10 text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] placeholder:text-slate-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-white/25"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm text-slate-600 dark:text-white/55">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 border-slate-400 text-slate-950 focus:ring-slate-950 dark:border-white/25 dark:bg-black/20 dark:text-white"
                    />
                    Remember me
                  </label>
                  <a
                    href="#"
                    className="font-medium text-slate-950 underline decoration-slate-950/30 underline-offset-4 hover:decoration-slate-950 dark:text-white dark:decoration-white/30"
                  >
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full justify-between border border-slate-950 bg-slate-950 px-5 text-sm text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-900 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
                >
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </main>
  );
}
