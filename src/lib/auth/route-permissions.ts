export const USER_ROLES = {
  ADMIN: "ROLE_ADMIN",
  SUPERVISOR: "ROLE_USER",
  USER: "ROLE_USER",
  THESIS_ADMIN: "ROLE_THESIS_ADMIN",
  THESIS_MEMBER: "ROLE_THESIS_MEMBER",
  THESIS_CONVENER: "ROLE_THESIS_CONVENER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

type RoutePermission = {
  path: string;
  roles: UserRole[];
  exact?: boolean;
};

export const protectedRoutePermissions: RoutePermission[] = [
  {
    path: "/admin",
    roles: [
      USER_ROLES.ADMIN,
      USER_ROLES.THESIS_ADMIN,
      USER_ROLES.THESIS_CONVENER,
    ],
  },
  {
    path: "/admin/dashboard",
    roles: [
      USER_ROLES.ADMIN,
      USER_ROLES.THESIS_ADMIN,
      USER_ROLES.THESIS_CONVENER,
    ],
  },
  {
    path: "/admin/semester",
    roles: [
      USER_ROLES.ADMIN,
      USER_ROLES.THESIS_ADMIN,
      USER_ROLES.THESIS_CONVENER,
    ],
  },
  {
    path: "/supervisor",
    roles: [
      USER_ROLES.SUPERVISOR,
      USER_ROLES.THESIS_ADMIN,
      USER_ROLES.THESIS_CONVENER,
    ],
  },
  {
    path: "/supervisor/dashboard",
    roles: [
      USER_ROLES.SUPERVISOR,
      USER_ROLES.THESIS_ADMIN,
      USER_ROLES.THESIS_CONVENER,
    ],
  },
  {
    path: "/supervisor/groups",
    roles: [
      USER_ROLES.SUPERVISOR,
      USER_ROLES.THESIS_ADMIN,
      USER_ROLES.THESIS_CONVENER,
    ],
  },
];

export function getRequiredRolesForPath(pathname: string): UserRole[] | null {
  const matchedRoute = protectedRoutePermissions
    .filter((route) => {
      if (route.exact) {
        return pathname === route.path;
      }

      return pathname === route.path || pathname.startsWith(`${route.path}/`);
    })
    .sort((a, b) => b.path.length - a.path.length)[0];

  return matchedRoute?.roles ?? null;
}

export function isPathAllowedForRoles(
  pathname: string,
  userRoles: string[] = [],
): boolean {
  const requiredRoles = getRequiredRolesForPath(pathname);

  if (!requiredRoles) {
    return true;
  }

  return requiredRoles.some((role) => userRoles.includes(role));
}
