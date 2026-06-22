"use client";

import { OBEGroup } from "@/components/Admin/types";
import { SemesterSelector } from "@/components/Supervisor/SemesterSelector";
import { DownloadButton } from "@/components/Thesis/DownloadButton";
import { OBEMarksTable } from "@/components/Thesis/OBEMarksTable";
import { useState, useMemo, useEffect } from "react";
import { useAdminThesisGroups } from "@/hooks/useAdminThesisGroups";
import { AdminThesisGroup } from "@/resources/admin/api";
import { getSemestersApi, Semester } from "@/resources/semester/api";
import {
  getGroupDocumentsApi,
  GroupDocument,
} from "@/resources/thesis-group/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { downloadOBEMarksCSV } from "@/utils/csvExport";

type AdminGroupWithDocument = Omit<AdminThesisGroup, "documents"> & {
  documents?: GroupDocument | null;
};

export default function OBEMarksPage() {
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [groupsWithDocuments, setGroupsWithDocuments] = useState<
    AdminGroupWithDocument[]
  >([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  // Fetch semesters
  const semestersQuery = useQuery({
    queryKey: ["semesters"],
    queryFn: getSemestersApi,
  });

  // Map semesters to selector format
  const semesterOptions = useMemo(
    () =>
      (semestersQuery.data || []).map((semester) => ({
        value: semester.id,
        label: semester.semesterName,
      })),
    [semestersQuery.data],
  );

  // Set default semester
  useEffect(() => {
    if (!selectedSemester && semesterOptions.length > 0) {
      setSelectedSemester(semesterOptions[0].value);
    }
  }, [selectedSemester, semesterOptions]);

  // Fetch thesis groups
  const adminGroupsQuery = useAdminThesisGroups({
    semesterId: selectedSemester,
    enabled: !!selectedSemester,
  });

  const groupsKey = useMemo(
    () => adminGroupsQuery.groups.map((group) => group.id).join("|"),
    [adminGroupsQuery.groups],
  );

  // Fetch documents for each group
  useEffect(() => {
    let isMounted = true;

    const fetchDocuments = async () => {
      if (!selectedSemester || adminGroupsQuery.groups.length === 0) {
        setGroupsWithDocuments((prev) => (prev.length === 0 ? prev : []));
        setIsLoadingDocuments(false);
        return;
      }

      setIsLoadingDocuments(true);
      try {
        const groupsWithDocs: AdminGroupWithDocument[] = await Promise.all(
          adminGroupsQuery.groups.map(async (group) => {
            try {
              const documents = await getGroupDocumentsApi({
                groupId: group.id,
                semesterId: selectedSemester,
              });
              return {
                ...group,
                documents: documents as unknown as GroupDocument | null,
              };
            } catch {
              return {
                ...group,
                documents: null as unknown as GroupDocument | null,
              };
            }
          }),
        );

        if (isMounted) {
          setGroupsWithDocuments(groupsWithDocs);
        }
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        if (isMounted) {
          setIsLoadingDocuments(false);
        }
      }
    };

    fetchDocuments();

    return () => {
      isMounted = false;
    };
  }, [groupsKey, selectedSemester]);

  // Transform API data to component format
  const groups: OBEGroup[] = useMemo(() => {
    return groupsWithDocuments.map((group: any) => {
      const document = group.documents;

      return {
        groupNo: group.supervisorGroup || group.globalGroupSerial || "N/A",
        classId: group.classId || "-",
        supervisorId: group.supervisorId,
        supervisorName: group.supervisorName,
        students: group.students.map((student: any) => {
          const marks = group.obeMarks?.[student.id] || {
            co1: 0,
            co2: 0,
            co3: 0,
            co4: 0,
            co5: 0,
          };
          return {
            studentId: student.studentId,
            studentName: student.name,
            cos: {
              co1: marks.co1,
              co2: marks.co2,
              co3: marks.co3,
              co4: marks.co4,
              co5: marks.co5,
            },
          };
        }),
        submissions: {
          researchProposal: !!document?.projectProposal,
          literatureReview: !!document?.literatureReview,
          methodology: !!document?.progressReport,
          book: !!document?.finalThesisBook,
          plagiarismReport: !!document?.plagiarismReport,
          aiReport: !!document?.aiDetectionReport,
          slide: !!document?.presentationSlide,
          poster: !!document?.poster,
          obeMarksheet: false,
        },
      };
    });
  }, [groupsWithDocuments]);

  const handleDownload = async () => {
    if (!groups || groups.length === 0) {
      toast.error("No groups available to download");
      return;
    }

    setIsDownloading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const semesterName =
        semestersQuery.data?.find((s) => s.id === selectedSemester)
          ?.semesterName || "Unknown";

      downloadOBEMarksCSV(adminGroupsQuery.groups, semesterName);
      toast.success("OBE Marks downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download OBE Marks");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDocumentDownload = (groupId: string, documentType: string) => {
    toast.success(`Downloading ${documentType} for ${groupId}...`);
    console.log(`Downloading ${documentType} for group ${groupId}`);
    // Implement actual download logic here
  };

  const isLoading =
    semestersQuery.isLoading ||
    adminGroupsQuery.isLoading ||
    isLoadingDocuments;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505]">
      <div className="mx-auto max-w-[95%] px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
            OBE Marks Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and download OBE marks for thesis groups
          </p>
        </div>

        {semesterOptions && semesterOptions.length > 0 && (
          <SemesterSelector
            selectedSemester={selectedSemester}
            onSemesterChange={setSelectedSemester}
            semesters={semesterOptions}
          />
        )}

        <DownloadButton
          onDownload={handleDownload}
          isDownloading={isDownloading}
        />

        {adminGroupsQuery.isError && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            Failed to load thesis groups. Please try again.
          </div>
        )}

        {isLoading && (
          <div className="mt-6 flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!isLoading && groups.length === 0 && selectedSemester && (
          <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded-lg">
            No thesis groups found for the selected semester.
          </div>
        )}

        {!isLoading && groups.length > 0 && (
          <div className="mt-6">
            <OBEMarksTable
              groups={groups}
              onDownloadDocument={handleDocumentDownload}
            />
          </div>
        )}
      </div>
    </div>
  );
}
