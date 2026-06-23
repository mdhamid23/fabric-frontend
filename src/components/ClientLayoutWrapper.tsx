"use client";

import { SidebarNav } from "@/components/sidebar-nav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarProvider } from "@/components/ui/sidebar";
import { isPathAllowedForRoles } from "@/lib/auth/route-permissions";
import { ChevronRight, Home, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);

  // Handle redirects for /admin and /supervisor
  //   useEffect(() => {
  //     if (pathname === "/admin") {
  //       router.push("/admin/dashboard");
  //     } else if (pathname === "/supervisor") {
  //       router.push("/supervisor/dashboard");
  //     }
  //   }, [pathname, router]);

  const isPublicShellRoute =
    pathname === "/" ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/authenticate") ||
    pathname.startsWith("/auth-callback") ||
    pathname.startsWith("/forgot-password");

  //   useEffect(() => {
  //     if (isPublicShellRoute) {
  //       setIsAuthReady(true);
  //       return;
  //     }

  //     const initAuth = async () => {
  //       try {
  //         const res = await fetch(`/api/auth/cookie`, {
  //           credentials: "include",
  //         });

  //         if (res.ok) {
  //           const authData = await res.json();

  //           if (!authData?.authenticated || !authData?.user) {
  //             throw new Error("Unauthenticated");
  //           }

  //           const userRoles = authData.user.roles ?? [];
  //           const isAllowed = isPathAllowedForRoles(pathname, userRoles);

  //           if (!isAllowed) {
  //             setIsAuthReady(true);
  //             setAuthUser(authData);
  //             router.replace("/unauthorized");
  //             return;
  //           }

  //           setAuthUser(authData);
  //           setIsAuthReady(true);
  //           return;
  //         }
  //       } catch (err) {
  //         // fallthrough to redirect
  //       }

  //       const next = encodeURIComponent(pathname || "/");
  //       window.location.replace(`/api/auth/login?next=${next}`);
  //     };

  //     initAuth();
  //   }, [isPublicShellRoute, pathname, router]);
  //   if (!isPublicShellRoute && !isAuthReady) {
  //     return (
  //       <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#040404]">
  //         <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black dark:border-gray-700 dark:border-t-white" />
  //       </div>
  //     );
  //   }

  // Public routes (landing page, auth pages)
  if (isPublicShellRoute) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white text-black dark:bg-[#040404] dark:text-white transition-colors duration-300">
        <header className="theme-nav sticky top-0 z-50">
          <div
            className="mx-auto flex w-full items-center justify-between py-4"
            style={{
              paddingLeft: "10%",
              paddingRight: "10%",
            }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center border border-neutral-300 bg-transparent text-[10px] font-bold tracking-[0.18em] text-black dark:border-white/10 dark:text-white">
                DEB
              </div>
              <span className="text-[20px] font-medium tracking-tight text-black dark:text-white">
                Certificate Verification
              </span>
            </div>

            <nav className="flex items-center gap-8 text-[15px] font-medium text-neutral-500 dark:text-white/50">
              <Link
                href="/"
                className="transition-colors hover:text-black dark:hover:text-white"
              >
                Verify
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="theme-shell relative flex flex-1 overflow-hidden">
          <div className="theme-grid pointer-events-none absolute inset-0 opacity-40" />
          <div
            className="relative z-10 mx-auto flex w-full flex-1 flex-col"
            style={{
              paddingLeft: "10%",
              paddingRight: "10%",
            }}
          >
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter((path) => path);
    const breadcrumbs = [];

    // Add Home breadcrumb
    breadcrumbs.push({
      label: "Dashboard",
      href: "/dashboard",
      isLast: paths.length === 0,
    });

    // Build breadcrumb path
    let currentPath = "";
    for (let i = 0; i < paths.length; i++) {
      currentPath += `/${paths[i]}`;
      const label = formatBreadcrumbLabel(paths[i], currentPath);

      breadcrumbs.push({
        label,
        href: currentPath,
        isLast: i === paths.length - 1,
      });
    }

    return breadcrumbs;
  };

  const formatBreadcrumbLabel = (path: string, fullPath: string): string => {
    // Custom labels for specific paths
    const customLabels: Record<string, string> = {
      dashboard: "Dashboard",
      supervisor: "Supervisor",
      admin: "Admin",
      semester: "Semester Management",
      "thesis-groups": "Thesis Groups",
      documents: "Documents",
      "obe-marks": "OBE Marks",
      "upload-evidence": "Upload Evidence",
      students: "Students",
      courses: "Courses",
      reports: "Reports",
      messages: "Messages",
      settings: "Settings",
      help: "Help Center",
    };

    // Check if we have a custom label for the full path
    if (customLabels[fullPath.substring(1)]) {
      return customLabels[fullPath.substring(1)];
    }

    // Check if we have a custom label for just the path segment
    if (customLabels[path]) {
      return customLabels[path];
    }

    // Format the path segment: convert kebab-case to Title Case
    return path
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const breadcrumbs = generateBreadcrumbs();

  // Authenticated routes with sidebar
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-[#040404]">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#050505]">
          <div className="flex h-16 items-center border-b border-gray-200 dark:border-white/10 px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center border border-neutral-300 bg-transparent text-[8px] font-bold tracking-[0.18em] text-black dark:border-white/10 dark:text-white">
                DEB
              </div>
              <span className="text-lg font-medium tracking-tight text-black dark:text-white">
                Certificate Verification
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4">
            <SidebarNav userRoles={authUser?.user?.roles ?? []} />
          </div>
        </aside>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#050505] md:hidden"
        >
          <Menu className="h-5 w-5 text-black dark:text-white" />
        </button>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed left-0 top-0 z-50 h-full w-64 transform animate-in slide-in-from-left duration-300 md:hidden">
              <div className="flex h-full flex-col bg-white dark:bg-[#050505] shadow-xl">
                <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-white/10 px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center border border-neutral-300 bg-transparent text-[8px] font-bold tracking-[0.18em] text-black dark:border-white/10 dark:text-white">
                      LOGO
                    </div>
                    <span className="text-lg font-medium tracking-tight text-black dark:text-white">
                      FST
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <X className="h-5 w-5 text-black dark:text-white" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <SidebarNav userRoles={authUser?.user?.roles ?? []} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <header
            className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white dark:border-white/10 dark:bg-[#050505]"
            style={{ paddingLeft: "1rem", paddingRight: "2rem" }}
          >
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2">
              <nav className="flex items-center gap-1 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center gap-1">
                    {index === 0 && (
                      <Home className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    )}
                    {crumb.isLast ? (
                      <span className="font-medium text-gray-900 dark:text-white">
                        {crumb.label}
                      </span>
                    ) : (
                      <>
                        <Link
                          href={crumb.href}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        >
                          {crumb.label}
                        </Link>
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400 dark:text-gray-600" />
                      </>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {authUser && (
                <>
                  <ThemeToggle />
                  <button className="flex h-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5 px-4">
                    <span className="text-sm font-medium text-black dark:text-white">
                      {authUser?.user?.profile?.name ??
                        authUser?.user?.username ??
                        "User"}
                    </span>
                  </button>
                  <a
                    href="/api/auth/logout"
                    title="Sign out"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </a>
                </>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div>{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
