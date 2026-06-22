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
import {
  ArrowRight,
  BadgeCheck,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export default function LoginPage() {
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
    <main className="relative flex min-h-[calc(100vh-1px)] items-center overflow-hidden bg-[#f5f1e8] text-slate-950 dark:bg-[#09090b] dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(15,23,42,0.08),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(202,138,4,0.12),_transparent_36%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.12),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(45,212,191,0.08),_transparent_36%)]" />
      <div className="absolute left-[-6rem] top-[-5rem] h-72 w-72 border border-slate-950/10 bg-white/45 shadow-[0_20px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.03]" />
      <div className="absolute bottom-[-6rem] right-[-4rem] h-80 w-80 border border-slate-950/10 bg-slate-950/5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.03]" />

      <motion.div
        className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="inline-flex items-center gap-2 border border-slate-950/10 bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60">
              <ShieldCheck className="h-4 w-4" />
              Secure access
            </div>

            <div className="space-y-4">
              <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-slate-600 dark:text-white/50">
                <BadgeCheck className="h-4 w-4" />
                Dhaka Education Board
              </p>
              <h1 className="max-w-lg text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                Sign in to verify certificates.
              </h1>
              <p className="max-w-lg text-base leading-7 text-slate-600 dark:text-white/60 sm:text-lg">
                Use your username and password to access the certificate
                verification dashboard and search official records.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border border-slate-950/10 bg-white/75 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.04]">
                <div className="text-3xl font-semibold">1</div>
                <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                  Step
                </div>
              </div>
              <div className="border border-slate-950/10 bg-white/75 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.04]">
                <div className="text-3xl font-semibold">2</div>
                <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                  Fields
                </div>
              </div>
              <div className="border border-slate-950/10 bg-white/75 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.04]">
                <div className="text-3xl font-semibold">1</div>
                <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-white/45">
                  Session
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className="lg:justify-self-end"
          >
            <Card className="w-full max-w-md border border-slate-950/10 bg-white/88 shadow-[0_30px_120px_rgba(15,23,42,0.14)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
              <CardHeader className="space-y-2">
                <CardTitle className="text-3xl font-semibold tracking-tight">
                  Login
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-600 dark:text-white/55">
                  Enter your username and password to continue.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form className="space-y-5">
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
                      Need help?
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

                <div className="mt-6 border border-slate-950/10 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-white/45">
                        Secure portal
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-white/60">
                        Access is restricted to authorized board users and
                        verification staff.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-sm text-slate-600 dark:text-white/60">
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
