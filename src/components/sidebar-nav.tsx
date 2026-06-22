"use client";

import { USER_ROLES } from "@/lib/auth/route-permissions";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  DockIcon,
  FileText,
  Group,
  LayoutDashboard,
  Shield,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

// const USER_ROLES = {
//   ADMIN: "ROLE_ADMIN",
//   SUPERVISOR: "ROLE_SUPERVISOR",
//   USER: "ROLE_USER",
// } as const;

type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

interface SubMenuItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  roles?: UserRole[];
}

interface MenuItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  roles?: UserRole[];
  submenu?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: "Supervisor",
    icon: <UserCog className="h-4 w-4" />,
    roles: [USER_ROLES.SUPERVISOR, USER_ROLES.ADMIN, USER_ROLES.THESIS_ADMIN],
    submenu: [
      {
        title: "Dashboard",
        href: "/supervisor/dashboard",
        icon: <LayoutDashboard className="h-3 w-3" />,
        roles: [USER_ROLES.SUPERVISOR],
      },
      {
        title: "Groups",
        href: "/supervisor/groups",
        icon: <Group className="h-3 w-3" />,
        roles: [USER_ROLES.SUPERVISOR],
      },
      {
        title: "Documents",
        href: "/supervisor/documents",
        icon: <FileText className="h-3 w-3" />,
        roles: [USER_ROLES.SUPERVISOR],
      },
    ],
  },
  {
    title: "Admin",
    icon: <Shield className="h-4 w-4" />,
    roles: [
      USER_ROLES.ADMIN,
      USER_ROLES.THESIS_ADMIN,
      USER_ROLES.THESIS_CONVENER,
    ],
    submenu: [
      // {
      //   title: "Dashboard",
      //   href: "/admin/dashboard",
      //   icon: <LayoutDashboard className="h-3 w-3" />,
      //   roles: [USER_ROLES.ADMIN, USER_ROLES.THESIS_ADMIN],
      // },
      {
        title: "Semester",
        href: "/admin/semester",
        icon: <CalendarDays className="h-3 w-3" />,
        roles: [
          USER_ROLES.ADMIN,
          USER_ROLES.THESIS_ADMIN,
          USER_ROLES.THESIS_CONVENER,
        ],
      },
      {
        title: "Groups",
        href: "/admin/thesis-groups",
        icon: <Group className="h-3 w-3" />,
        roles: [
          USER_ROLES.ADMIN,
          USER_ROLES.THESIS_ADMIN,
          USER_ROLES.THESIS_CONVENER,
        ],
      },
      {
        title: "Documents",
        href: "/admin/documents",
        icon: <DockIcon className="h-3 w-3" />,
        roles: [
          USER_ROLES.ADMIN,
          USER_ROLES.THESIS_ADMIN,
          USER_ROLES.THESIS_CONVENER,
        ],
      },
      {
        title: "Approval Requests",
        href: "/admin/approval-requests",
        icon: <AlertTriangle className="h-3 w-3" />,
        roles: [USER_ROLES.ADMIN, USER_ROLES.THESIS_ADMIN],
      },
    ],
  },
];

function hasRequiredRole(userRoles: string[], requiredRoles?: UserRole[]) {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  return requiredRoles.some((role) => userRoles.includes(role));
}

function getAllowedMenuItems(userRoles: string[]): MenuItem[] {
  return menuItems
    .filter((item) => hasRequiredRole(userRoles, item.roles))
    .map((item) => {
      const allowedSubmenu = item.submenu?.filter((subitem) =>
        hasRequiredRole(userRoles, subitem.roles),
      );

      return {
        ...item,
        submenu: allowedSubmenu,
      };
    })
    .filter((item) => {
      if (!item.submenu) {
        return Boolean(item.href);
      }

      return item.submenu.length > 0;
    });
}

export function SidebarNav({
  className,
  userRoles = [],
}: {
  className?: string;
  userRoles?: string[];
}) {
  const pathname = usePathname();

  const allowedMenuItems = React.useMemo(
    () => getAllowedMenuItems(userRoles),
    [userRoles],
  );

  const defaultOpenMenus = React.useMemo(() => {
    return allowedMenuItems.reduce<Record<string, boolean>>((acc, item) => {
      const isActiveMenu = item.submenu?.some((sub) => {
        return pathname === sub.href || pathname?.startsWith(`${sub.href}/`);
      });

      acc[item.title] = Boolean(isActiveMenu) || item.title === "Supervisor";
      return acc;
    }, {});
  }, [allowedMenuItems, pathname]);

  const [openMenus, setOpenMenus] =
    React.useState<Record<string, boolean>>(defaultOpenMenus);

  React.useEffect(() => {
    setOpenMenus((prev) => ({
      ...defaultOpenMenus,
      ...prev,
    }));
  }, [defaultOpenMenus]);

  const toggleSubmenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  if (allowedMenuItems.length === 0) {
    return (
      <nav className={cn("flex flex-col gap-1 p-3", className)}>
        <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
          No menu available for your role.
        </p>
      </nav>
    );
  }

  return (
    <nav className={cn("flex flex-col gap-1 p-3", className)}>
      {allowedMenuItems.map((item) => {
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const isOpen = openMenus[item.title];

        if (hasSubmenu) {
          return (
            <div key={item.title} className="flex flex-col">
              <button
                type="button"
                onClick={() => toggleSubmenu(item.title)}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                  "hover:bg-gray-100",
                  "dark:hover:bg-gray-100 dark:hover:text-gray-900",
                  "text-gray-700 dark:text-white",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 dark:text-white">
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-gray-600 dark:text-white"
                >
                  <ChevronDown className="h-3 w-3" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-6 mt-1 flex flex-col gap-1">
                      {item.submenu?.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
                            "hover:bg-gray-100",
                            "dark:hover:bg-gray-100 dark:hover:text-gray-900",
                            isActive(subitem.href) &&
                              "bg-gray-100 text-gray-900 dark:bg-gray-100 dark:text-gray-900",
                            !isActive(subitem.href) &&
                              "text-gray-700 dark:text-white",
                          )}
                        >
                          <span
                            className={cn(
                              "transition-colors",
                              isActive(subitem.href)
                                ? "text-gray-900 dark:text-gray-900"
                                : "text-gray-600 dark:text-white",
                            )}
                          >
                            {subitem.icon}
                          </span>
                          <span>{subitem.title}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        return (
          <Link
            key={item.title}
            href={item.href!}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
              "hover:bg-gray-100",
              "dark:hover:bg-gray-100 dark:hover:text-gray-900",
              "text-gray-700 dark:text-white",
            )}
          >
            <span className="text-gray-600 dark:text-white">{item.icon}</span>
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
