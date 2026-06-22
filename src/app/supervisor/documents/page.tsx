"use client";

import { SemesterSelector } from "@/components/Supervisor/SemesterSelector";
import { getSupervisorGroupsApi } from "@/resources/thesis-group/api";
import { getSemestersApi } from "@/resources/semester/api";
import { Download, FileText, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGroupDocumentsApi } from "@/resources/thesis-group/api";
import { GroupDocument } from "@/resources/thesis-group/api";
import { ThesisGroup } from "@/components/Supervisor/types/index";
import { useThesisGroups } from "@/hooks/useThesisGroup";

interface SupervisorGroupWithDocuments extends ThesisGroup {
  documents?: GroupDocument | null;
}

const DOCUMENT_FIELDS = [
  { key: "literatureReview", label: "Literature Review" },
  { key: "projectProposal", label: "Project Proposal" },
  { key: "progressReport", label: "Progress Report" },
  { key: "finalThesisBook", label: "Final Thesis Book" },
  { key: "plagiarismReport", label: "Plagiarism Report" },
  { key: "aiDetectionReport", label: "AI Detection Report" },
  { key: "presentationSlide", label: "Presentation Slide" },
  { key: "poster", label: "Poster" },
] as const;

interface SemesterOption {
  value: string;
  label: string;
}

function SupervisorDocumentsContent() {
  const searchParams = useSearchParams();
  const { supervisorId } = useThesisGroups();
  // const supervisorId = searchParams.get("supervisorId");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [groupsWithDocuments, setGroupsWithDocuments] = useState<
    SupervisorGroupWithDocuments[] | any
  >([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  const semestersQuery = useQuery({
    queryKey: ["semesters"],
    queryFn: getSemestersApi,
  });

  const semesterOptions: SemesterOption[] = (semestersQuery.data ?? []).map(
    (semester) => ({
      value: semester.id,
      label: semester.semesterName,
    }),
  );

  useEffect(() => {
    if (!selectedSemester && semesterOptions.length > 0) {
      setSelectedSemester(semesterOptions[0].value);
    }
  }, [selectedSemester, semesterOptions]);

  // Fetch groups
  const groupsQuery = useQuery({
    queryKey: ["supervisor-groups", supervisorId, selectedSemester],
    queryFn: async () => {
      const groups = await getSupervisorGroupsApi({
        supervisorId: supervisorId ?? undefined,
        semesterId: selectedSemester,
      });
      return groups;
    },
    enabled: Boolean(selectedSemester),
  });

  // Fetch documents for each group
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!groupsQuery.data || groupsQuery.data.length === 0) {
        setGroupsWithDocuments([]);
        return;
      }

      setIsLoadingDocuments(true);
      try {
        const groupsWithDocs = await Promise.all(
          groupsQuery.data.map(async (group) => {
            try {
              const documents = await getGroupDocumentsApi({
                groupId: group.id,
                semesterId: selectedSemester,
              });
              return { ...group, documents };
            } catch {
              return { ...group, documents: null };
            }
          }),
        );
        setGroupsWithDocuments(groupsWithDocs);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    fetchDocuments();
  }, [groupsQuery.data, selectedSemester]);

  const handleDownloadDocument = (
    groupName: string,
    documentLabel: string,
    documentPath: string,
  ) => {
    const anchorElement = document.createElement("a");
    anchorElement.href = `/api${documentPath}`;
    anchorElement.download = `${groupName}-${documentLabel}`;
    anchorElement.click();
  };

  const renderDocumentCell = (
    groupName: string,
    documentLabel: string,
    documentPath?: string,
  ) => {
    if (documentPath) {
      return (
        <button
          onClick={() =>
            handleDownloadDocument(groupName, documentLabel, documentPath)
          }
          className="inline-flex items-center justify-center p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
          title={`Download ${documentLabel}`}
        >
          <Download className="h-4 w-4" />
        </button>
      );
    } else {
      return (
        <div className="inline-flex items-center justify-center p-1.5 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
          <XCircle className="h-4 w-4" />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505]">
      <div className="mx-auto max-w-[95%] px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            <h1 className="text-2xl font-bold text-black dark:text-white">
              Group Documents
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            View and download all thesis group documents
          </p>
        </div>

        {/* Semester Selector */}
        <SemesterSelector
          semesters={semesterOptions}
          selectedSemester={selectedSemester}
          onSemesterChange={setSelectedSemester}
        />

        {/* Loading State */}
        {(semestersQuery.isLoading ||
          groupsQuery.isLoading ||
          isLoadingDocuments) && (
          <div className="mt-6 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-8">
            <div className="flex justify-center items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-pulse" />
              <p className="text-gray-600 dark:text-gray-400">
                Loading documents...
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!semestersQuery.isLoading &&
          !groupsQuery.isLoading &&
          !isLoadingDocuments &&
          groupsWithDocuments.length === 0 && (
            <div className="mt-6 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No groups found for the selected semester
              </p>
            </div>
          )}

        {/* Documents Table */}
        {!semestersQuery.isLoading &&
          !groupsQuery.isLoading &&
          !isLoadingDocuments &&
          groupsWithDocuments.length > 0 && (
            <div className="mt-6 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] overflow-x-auto">
              <div className="min-w-[2000px]">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-[#050505] border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[150px] sticky left-0 bg-gray-50 dark:bg-[#050505] z-20">
                        Group Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[120px]">
                        Group No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[100px]">
                        Domain
                      </th>
                      {DOCUMENT_FIELDS.map((field) => (
                        <th
                          key={field.key}
                          className="px-4 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white min-w-[120px]"
                        >
                          {field.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groupsWithDocuments.map((group: any) => (
                      <tr
                        key={group.id}
                        className="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#0a0a0a]/50 transition-colors"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white min-w-[150px] sticky left-0 bg-white dark:bg-[#0a0a0a] z-10">
                          {group.name}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 min-w-[120px]">
                          {group.groupNo}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 min-w-[100px]">
                          {group.domain}
                        </td>
                        {DOCUMENT_FIELDS.map((field) => (
                          <td
                            key={field.key}
                            className="px-4 py-4 text-center min-w-[120px]"
                          >
                            {renderDocumentCell(
                              group.name,
                              field.label,
                              group.documents?.[
                                field.key as keyof Omit<
                                  GroupDocument,
                                  | "id"
                                  | "thesisGroupId"
                                  | "semesterId"
                                  | "plagiarismPercentage"
                                  | "aiDetectionPercentage"
                                  | "createdAt"
                                  | "updatedAt"
                                >
                              ] as string | undefined,
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2026 Thesis Management System
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SupervisorDocumentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      }
    >
      <SupervisorDocumentsContent />
    </Suspense>
  );
}
