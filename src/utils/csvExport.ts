import { AdminThesisGroup } from "@/resources/admin/api";

interface CSVRowData {
  [key: string]: string | number | boolean;
}

export function convertToCSV(data: CSVRowData[]): string {
  if (data.length === 0) {
    return "";
  }

  // Get all unique keys from all objects
  const keys = Array.from(new Set(data.flatMap((obj) => Object.keys(obj))));

  // Create header row
  const header = keys.join(",");

  // Create data rows
  const rows = data.map((obj) =>
    keys
      .map((key) => {
        const value = obj[key];
        const stringValue = String(value ?? "");

        // Escape quotes and wrap in quotes if containing comma or newline
        if (
          stringValue.includes(",") ||
          stringValue.includes('"') ||
          stringValue.includes("\n")
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }

        return stringValue;
      })
      .join(","),
  );

  return [header, ...rows].join("\n");
}

export function exportToCSV(
  data: CSVRowData[],
  filename: string = "export.csv",
): void {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL
  URL.revokeObjectURL(url);
}

export function generateOBEMarksCSV(groups: AdminThesisGroup[]): string {
  const csvData: CSVRowData[] = [];

  groups.forEach((group) => {
    group.students.forEach((student) => {
      const obeMarks = group.obeMarks?.[student.id] || {
        co1: 0,
        co2: 0,
        co3: 0,
        co4: 0,
        co5: 0,
      };

      csvData.push({
        "Group No": group.supervisorGroup || group.globalGroupSerial || "N/A",
        "Class ID": group.classId || "N/A",
        Supervisor: group.supervisorName,
        "Student ID": student.studentId,
        "Student Name": student.name,
        CO1: obeMarks.co1,
        CO2: obeMarks.co2,
        CO3: obeMarks.co3,
        CO4: obeMarks.co4,
        CO5: obeMarks.co5,
        Average: parseFloat(
          (
            (obeMarks.co1 +
              obeMarks.co2 +
              obeMarks.co3 +
              obeMarks.co4 +
              obeMarks.co5) /
            5
          ).toFixed(2),
        ),
        CGPA: student.cgpa,
        "Credit Completed": student.creditCompleted,
        "Research Methodology": student.researchMethodologyCompleted,
      });
    });
  });

  return convertToCSV(csvData);
}

export function downloadOBEMarksCSV(
  groups: AdminThesisGroup[],
  semester: string = "Spring 2025-26",
): void {
  const csv = generateOBEMarksCSV(groups);
  const filename = `OBE-Marks-${semester.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
