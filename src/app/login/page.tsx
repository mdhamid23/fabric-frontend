"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Loader2,
  LogIn,
  ShieldCheck,
  User,
  Lock,
  AlertCircle,
} from "lucide-react";
import { login } from "@/resources/auth/service";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error
    setError(null);

    // Validate inputs
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({
        username: username.trim(),
        password: password.trim(),
      });

      // Login successful - auth data is already stored in localStorage by the API
      console.log("Login successful:", response.user);

      // Redirect to dashboard or home page
      router.push("/certificates");
      router.refresh(); // Refresh to update any server components
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f1e8] text-slate-950 dark:bg-[#09090b] dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.09),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(202,138,4,0.12),_transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.08),_transparent_34%)]" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border border-slate-950/10 bg-white/90 shadow-[0_30px_120px_rgba(15,23,42,0.14)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center border border-slate-950/10 bg-slate-950 text-white dark:border-white/10 dark:bg-white dark:text-slate-950">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <CardTitle className="text-3xl font-semibold tracking-tight">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-600 dark:text-white/55">
                Sign in to your account to manage certificates
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-50 p-4 dark:bg-red-950/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-white/45"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/25" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      className="h-12 border-slate-950/10 bg-white pl-10 text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] placeholder:text-slate-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-white/25"
                      required
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
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/25" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-12 border-slate-950/10 bg-white pl-10 text-base shadow-[0_12px_24px_rgba(15,23,42,0.04)] placeholder:text-slate-400 dark:border-white/10 dark:bg-black/20 dark:placeholder:text-white/25"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full justify-between border border-slate-950 bg-slate-950 px-5 text-sm text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-900 disabled:opacity-70 disabled:hover:translate-y-0 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
                >
                  <span>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </span>
                  {!isLoading && <LogIn className="h-4 w-4" />}
                </Button>

                <div className="text-center text-sm text-slate-600 dark:text-white/55">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-slate-950 underline decoration-slate-950/30 underline-offset-4 hover:decoration-slate-950 dark:text-white dark:decoration-white/30"
                  >
                    Create one
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
