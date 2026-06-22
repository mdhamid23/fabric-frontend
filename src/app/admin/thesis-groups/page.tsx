"use client";

import { ThesisGroup } from "@/components/Admin/types";
import { FilterSection } from "@/components/Thesis/FilterSelection";
import { SearchBar } from "@/components/Thesis/SearchBar";
import { ThesisTable } from "@/components/Thesis/ThesisTable";
import { getSemestersApi } from "@/resources/semester/api";
import {
  getAdminThesisGroupsApi,
  updateAdminThesisGroupApi,
} from "@/resources/thesis-group/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function ThesisGroupManagementPage() {
  const queryClient = useQueryClient();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [thesisGroups, setThesisGroups] = useState<ThesisGroup[]>([]);

  const semestersQuery = useQuery({
    queryKey: ["semesters"],
    queryFn: getSemestersApi,
  });

  const semesterOptions = useMemo(
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
    queryKey: ["admin-thesis-groups", selectedSemester],
    queryFn: () =>
      getAdminThesisGroupsApi({ semesterId: selectedSemester || undefined }),
    enabled: Boolean(selectedSemester),
  });

  useEffect(() => {
    if (groupsQuery.data) {
      setThesisGroups(groupsQuery.data);
    }
  }, [groupsQuery.data]);

  const updateGroupMutation = useMutation({
    mutationFn: (params: {
      id: string;
      payload: {
        classId?: string;
        externalId?: string;
        thesisManagementTeamRemark?: string;
        registrationCompleted?: boolean;
      };
    }) => updateAdminThesisGroupApi(params),
  });

  const filters = [
    {
      label: "Submitted",
      value: "submitted",
      count: thesisGroups.filter((group) => group.status === "submitted")
        .length,
    },
    {
      label: "Action Needed",
      value: "action_needed",
      count: thesisGroups.filter((group) => group.status === "action_needed")
        .length,
    },
    {
      label: "Resubmitted",
      value: "resubmitted",
      count: thesisGroups.filter((group) => group.status === "resubmitted")
        .length,
    },
    {
      label: "Completed",
      value: "completed",
      count: thesisGroups.filter((group) => group.status === "completed")
        .length,
    },
  ];

  const toggleFilter = (filterValue: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterValue)
        ? prev.filter((f) => f !== filterValue)
        : [...prev, filterValue],
    );
  };

  const handleUpdateGroup = (
    groupId: string,
    field: keyof ThesisGroup,
    value: string,
  ) => {
    setThesisGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, [field]: value, isEdited: true }
          : group,
      ),
    );
  };
  const handleMarkRegistrationComplete = async (groupId: string) => {
    const group = thesisGroups.find((g) => g.id === groupId);
    if (!group) return;

    const loadingId = toast.loading(
      `Marking registration complete for group ${group.groupNo}...`,
    );

    try {
      await updateGroupMutation.mutateAsync({
        id: groupId,
        payload: {
          classId: group.classId?.trim() || undefined,
          externalId: group.extId?.trim() || undefined,
          registrationCompleted: true,
        },
      });

      setThesisGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                status: "completed",
                registrationCompleted: true,
                registrationStatus: "completed",
                isEdited: false,
              }
            : g,
        ),
      );

      await queryClient.invalidateQueries({
        queryKey: ["admin-thesis-groups", selectedSemester],
      });

      toast.success(`Registration completed for group ${group.groupNo}.`, {
        id: loadingId,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to complete registration.",
        { id: loadingId },
      );
    }
  };

  const handleSaveChanges = async (groupId: string) => {
    const group = thesisGroups.find((g) => g.id === groupId);
    if (!group) return;

    const loadingId = toast.loading(`Saving group ${group.groupNo}...`);

    try {
      await updateGroupMutation.mutateAsync({
        id: groupId,
        payload: {
          classId: group.classId?.trim() || undefined,
          externalId: group.extId?.trim() || undefined,
        },
      });

      setThesisGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                isEdited: false,
              }
            : g,
        ),
      );

      await queryClient.invalidateQueries({
        queryKey: ["admin-thesis-groups", selectedSemester],
      });

      toast.success(`Group ${group.groupNo} saved successfully.`, {
        id: loadingId,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save group changes.",
        { id: loadingId },
      );
    }
  };
  const handleSendBackForRevision = async (groupId: string) => {
    const group = thesisGroups.find((g) => g.id === groupId);
    if (!group) return;

    const remark = group.thesisMgmtRemark?.trim();

    if (!remark) {
      toast.error(
        "Please add a thesis management team remark before sending back.",
      );
      return;
    }

    const loadingId = toast.loading(
      `Sending group ${group.groupNo} back for revision...`,
    );

    try {
      await updateGroupMutation.mutateAsync({
        id: groupId,
        payload: {
          classId: group.classId?.trim() || undefined,
          externalId: group.extId?.trim() || undefined,
          thesisManagementTeamRemark: remark,
        },
      });

      setThesisGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? {
                ...g,
                status: "action_needed",
                thesisMgmtRemark: remark,
                isEdited: false,
              }
            : g,
        ),
      );

      await queryClient.invalidateQueries({
        queryKey: ["admin-thesis-groups", selectedSemester],
      });

      toast.success(`Group ${group.groupNo} sent back for revision.`, {
        id: loadingId,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send group back for revision.",
        { id: loadingId },
      );
    }
  };

  const filteredGroups = thesisGroups.filter((group) => {
    if (selectedFilters.length > 0 && !selectedFilters.includes(group.status)) {
      return false;
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();

      return (
        (group.classId ?? "").toLowerCase().includes(searchLower) ||
        (group.groupNo ?? "").toLowerCase().includes(searchLower) ||
        (group.supervisorName ?? "").toLowerCase().includes(searchLower) ||
        group.students.some((student) =>
          (student.name ?? "").toLowerCase().includes(searchLower),
        )
      );
    }

    return true;
  });

  const handleDownload = async () => {
    try {
      setDownloading(true);

      const rows = filteredGroups.map((group) => ({
        id: group.id,
        classId: group.classId,
        groupNo: group.groupNo,
        supervisorId: group.supervisorId,
        supervisorName: group.supervisorName,
        extId: group.extId,
        studentIds: group.students.map((student) => student.id).join(" | "),
        studentNames: group.students.map((student) => student.name).join(" | "),
        status: group.status,
        registrationStatus: group.registrationStatus,
        supervisorRemark: group.remark,
        thesisMgmtRemark: group.thesisMgmtRemark,
      }));

      const headers = Object.keys(
        rows[0] ?? {
          id: "",
          classId: "",
          groupNo: "",
          supervisorId: "",
          supervisorName: "",
          extId: "",
          studentIds: "",
          studentNames: "",
          status: "",
          registrationStatus: "",
          supervisorRemark: "",
          thesisMgmtRemark: "",
        },
      );

      const csv = [
        headers.join(","),
        ...rows.map((row) =>
          headers
            .map((header) => {
              const cell = String(row[header as keyof typeof row] ?? "");
              return `"${cell.replace(/"/g, '""')}"`;
            })
            .join(","),
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `thesis-groups-${selectedSemester || "all"}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);

      toast.success("File downloaded successfully!");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505]">
      <div className="mx-auto max-w-[95%] px-4 py-8">
        <FilterSection
          filters={filters}
          selectedFilters={selectedFilters}
          onFilterToggle={toggleFilter}
          onDownload={handleDownload}
          downloading={downloading}
          semesters={semesterOptions}
          selectedSemester={selectedSemester}
          onSemesterChange={setSelectedSemester}
        />

        {(groupsQuery.isLoading || semestersQuery.isLoading) && (
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Loading thesis groups...
          </p>
        )}

        {(groupsQuery.error || semestersQuery.error) && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">
            {groupsQuery.error instanceof Error
              ? groupsQuery.error.message
              : semestersQuery.error instanceof Error
                ? semestersQuery.error.message
                : "Failed to load thesis group data."}
          </p>
        )}

        <SearchBar value={searchTerm} onChange={setSearchTerm} />

        <ThesisTable
          groups={filteredGroups}
          onUpdateGroup={handleUpdateGroup}
          onSaveChanges={handleSaveChanges}
          onSendBackForRevision={handleSendBackForRevision}
          onMarkRegistrationComplete={handleMarkRegistrationComplete}
        />
      </div>
    </div>
  );
}
