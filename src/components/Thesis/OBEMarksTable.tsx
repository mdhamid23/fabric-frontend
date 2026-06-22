"use client";

import { Fragment } from "react";
import { Download, XCircle } from "lucide-react";
import { OBEGroup } from "../Admin/types";

interface OBEMarksTableProps {
  groups: OBEGroup[];
  onDownloadDocument?: (groupId: string, documentType: string) => void;
}

export function OBEMarksTable({
  groups,
  onDownloadDocument,
}: OBEMarksTableProps) {
  const handleDownload = (
    groupId: string,
    documentType: string,
    isSubmitted: boolean,
  ) => {
    if (isSubmitted && onDownloadDocument) {
      onDownloadDocument(groupId, documentType);
    }
  };

  const renderDocumentStatus = (
    isSubmitted: boolean,
    groupId: string,
    documentType: string,
  ) => {
    if (isSubmitted) {
      return (
        <button
          onClick={() => handleDownload(groupId, documentType, true)}
          className="inline-flex items-center justify-center p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
          title="Download document"
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
    <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] overflow-x-auto">
      <div className="min-w-[1800px]">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-[#050505] border-b border-gray-200 dark:border-white/10 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[100px] sticky left-0 bg-gray-50 dark:bg-[#050505] z-20">
                Group No
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[100px]">
                Class ID
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[100px]">
                Supervisor Id
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[150px]">
                Supervisor Name
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white min-w-[120px]">
                Research Proposal
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white min-w-[120px]">
                Literature Review
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white min-w-[100px]">
                Methodology
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white min-w-[80px]">
                Book
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white min-w-[120px]">
                Plagiarism Report
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white min-w-[100px]">
                AI Report
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white min-w-[80px]">
                Slide
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white min-w-[80px]">
                Poster
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white min-w-[120px]">
                OBE Marksheet
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[120px]">
                Student ID
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white min-w-[150px]">
                Student Name
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white min-w-[70px]">
                CO1
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white min-w-[70px]">
                CO2
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white min-w-[70px]">
                CO3
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white min-w-[70px]">
                CO4
              </th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white min-w-[70px]">
                CO5
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10">
            {groups.map((group, index) => (
              <Fragment key={group.groupNo}>
                {group.students.map((student, studentIndex) => (
                  <tr
                    key={`${group.groupNo}-${student.studentId}`}
                    className={`hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                      studentIndex === 0
                        ? "border-t border-gray-200 dark:border-white/10"
                        : ""
                    }`}
                  >
                    {/* Group Info - Show only for first student of each group, with rowspan */}
                    {studentIndex === 0 && (
                      <>
                        <td
                          rowSpan={group.students.length}
                          className="px-3 py-3 text-sm font-medium text-gray-900 dark:text-white align-top bg-white dark:bg-[#0a0a0a] sticky left-0 z-10"
                        >
                          {group.groupNo}
                        </td>
                        <td
                          rowSpan={group.students.length}
                          className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400 align-top"
                        >
                          {group.classId}
                        </td>
                        <td
                          rowSpan={group.students.length}
                          className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400 align-top"
                        >
                          {group.supervisorId}
                        </td>
                        <td
                          rowSpan={group.students.length}
                          className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400 align-top"
                        >
                          {group.supervisorName}
                        </td>
                        <td
                          rowSpan={group.students.length}
                          className="px-3 py-3 text-center align-top"
                        >
                          {renderDocumentStatus(
                            group.submissions.researchProposal,
                            group.groupNo,
                            "Research Proposal",
                          )}
                        </td>
                        <td
                          rowSpan={group.students.length}
                          className="px-3 py-3 text-center align-top"
                        >
                          {renderDocumentStatus(
                            group.submissions.literatureReview,
                            group.groupNo,
                            "Literature Review",
                          )}
                        </td>
                        <td
                          rowSpan={group.students.length}
                          className="px-3 py-3 text-center align-top"
                        >
                          {renderDocumentStatus(
                            group.submissions.methodology,
                            group.groupNo,
                            "Methodology",
                          )}
                        </td>
                        <td
                          rowSpan={group.students.length}
                          className="px-3 py-3 text-center align-top"
                        >
                          {renderDocumentStatus(
                            group.submissions.book,
                            group.groupNo,
                            "Book",
                          )}
                        </td>
                        <td
                          rowSpan={group.students.length}
                          className="px-3 py-3 text-center align-top"
                        >
                          {renderDocumentStatus(
                            group.submissions.plagiarismReport,
                            group.groupNo,
                            "Plagiarism Report",
                          )}
                        </td>
                        <td
                          rowSpan={group.students.length}
                          className="px-3 py-3 text-center align-top"
                        >
                          {renderDocumentStatus(
                            group.submissions.aiReport,
                            group.groupNo,
                            "AI Report",
                          )}
                        </td>
                        <td
                          rowSpan={group.students.length}
                          className="px-3 py-3 text-center align-top"
                        >
                          {renderDocumentStatus(
                            group.submissions.slide,
                            group.groupNo,
                            "Slide",
                          )}
                        </td>
                        <td
                          rowSpan={group.students.length}
                          className="px-3 py-3 text-center align-top"
                        >
                          {renderDocumentStatus(
                            group.submissions.poster,
                            group.groupNo,
                            "Poster",
                          )}
                        </td>
                        <td
                          rowSpan={group.students.length}
                          className="px-3 py-3 text-center align-top"
                        >
                          {renderDocumentStatus(
                            group.submissions.obeMarksheet,
                            group.groupNo,
                            "OBE Marksheet",
                          )}
                        </td>
                      </>
                    )}

                    {/* Student Info - Shown for every student */}
                    <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {student.studentId}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {student.studentName}
                    </td>

                    {/* Individual CO Marks */}
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                          student.cos.co1 >= 3
                            ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                            : student.cos.co1 >= 2
                              ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                              : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {student.cos.co1}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                          student.cos.co2 >= 3
                            ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                            : student.cos.co2 >= 2
                              ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                              : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {student.cos.co2}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                          student.cos.co3 >= 3
                            ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                            : student.cos.co3 >= 2
                              ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                              : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {student.cos.co3}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                          student.cos.co4 >= 3
                            ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                            : student.cos.co4 >= 2
                              ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                              : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {student.cos.co4}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                          student.cos.co5 >= 3
                            ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                            : student.cos.co5 >= 2
                              ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                              : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {student.cos.co5}
                      </span>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
