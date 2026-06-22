// app/supervisor/dashboard/hooks/useThesisGroups.ts
import { ThesisGroup } from "@/components/Supervisor/types";
import { getSupervisorGroupsApi } from "@/resources/thesis-group/api";
import { getSemestersApi, Semester } from "@/resources/semester/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

interface SemesterOption {
  value: string;
  label: string;
}

type AuthUserProfile = {
  id: number;
  username: string;
  facultyId?: string | null;
  name?: string | null;
  email?: string | null;
  designation?: string | null;
  roomNo?: string | null;
  phoneNo?: string | null;
  profileCompleted?: boolean;
};

type AuthUser = {
  id: number;
  username: string;
  email: string;
  roles: string[];
  profile?: AuthUserProfile | null;
};

type AuthCookieResponse = {
  authenticated: boolean;
  user?: AuthUser;
};

async function getCurrentAuthUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/cookie", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as AuthCookieResponse;

  if (!data.authenticated || !data.user) {
    return null;
  }

  return data.user;
}

function getSupervisorIdFromAuthUser(user: AuthUser | null): string {
  if (!user) {
    return "";
  }

  return user.profile?.facultyId || user.username || String(user.id);
}

export function useThesisGroups() {
  const [selectedSemester, setSelectedSemester] = useState("");

  const authUserQuery = useQuery({
    queryKey: ["current-auth-user"],
    queryFn: getCurrentAuthUser,
  });

  const supervisorId = useMemo(
    () => getSupervisorIdFromAuthUser(authUserQuery.data ?? null),
    [authUserQuery.data],
  );
  const roles = authUserQuery.data?.roles ?? authUserQuery.data?.roles ?? [];

  const role = roles.includes("ROLE_USER")
    ? "supervisor"
    : roles.includes("ROLE_ADMIN") || roles.includes("ROLE_THESIS_ADMIN")
      ? "admin"
      : "unknown";

  const semestersQuery = useQuery({
    queryKey: ["semesters"],
    queryFn: getSemestersApi,
  });

  const semesterOptions = useMemo<SemesterOption[]>(
    () =>
      (semestersQuery.data ?? []).map((semester) => ({
        value: semester.id,
        label: semester.semesterName,
      })),
    [semestersQuery.data],
  );

  useEffect(() => {
    if (!selectedSemester && semesterOptions.length > 0) {
      setSelectedSemester(semesterOptions[0].value);
    }
  }, [selectedSemester, semesterOptions]);

  const groupsQuery = useQuery({
    queryKey: ["supervisor-groups", selectedSemester, supervisorId],
    queryFn: () =>
      getSupervisorGroupsApi({
        semesterId: selectedSemester,
        supervisorId: supervisorId || undefined,
      }),
    enabled: Boolean(selectedSemester) && Boolean(supervisorId),
  });

  const handleViewDetails = (groupId: string) => {
    console.log("View details for group:", groupId);
  };

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
  };

  const groups = groupsQuery.data ?? [];
  const semesters = semestersQuery.data ?? [];

  const selectedSemesterData = useMemo<Semester | null>(
    () =>
      semesters.find((semester) => semester.id === selectedSemester) ?? null,
    [semesters, selectedSemester],
  );

  const selectedSemesterLabel =
    selectedSemesterData?.semesterName ?? "the selected semester";

  const isLoading =
    authUserQuery.isLoading ||
    semestersQuery.isLoading ||
    groupsQuery.isLoading;

  const error =
    (authUserQuery.error instanceof Error
      ? authUserQuery.error.message
      : null) ||
    (groupsQuery.error instanceof Error ? groupsQuery.error.message : null) ||
    (semestersQuery.error instanceof Error
      ? semestersQuery.error.message
      : null);

  return {
    groups,
    semesters: semesterOptions,
    selectedSemesterData,
    selectedSemesterLabel,
    selectedSemester,
    supervisorId,
    authUser: authUserQuery.data ?? null,
    isLoading,
    error,
    reloadGroups: groupsQuery.refetch,
    handleViewDetails,
    handleSemesterChange,
    role,
    isAuthLoading: authUserQuery.isLoading,
  };
}
