import { API_SERVICE } from "@/config/axios-config";
import { AxiosError } from "axios";

export interface OBEMarks {
  [studentId: string]: {
    co1: number;
    co2: number;
    co3: number;
    co4: number;
    co5: number;
  };
}

export interface AdminThesisGroup {
  id: string;
  semesterId: string;
  classId?: string;
  globalGroupSerial?: string;
  supervisorGroup?: string;
  externalId?: string;
  externalName?: string;
  thesisManagementTeamRemark?: string;
  supervisorRemark?: string;
  supervisorId: string;
  supervisorName: string;
  supervisorEmail: string;
  proposedTitle: string;
  thesisDomain: string;
  shortDescription: string;
  numberOfStudents: number;
  acceptTerms: boolean;
  students: Array<{
    id: string;
    studentId: string;
    name: string;
    cgpa: string;
    primaryEmail: string;
    secondaryEmail?: string;
    phoneNo: string;
    creditCompleted: string;
    creditTakeWithThesis?: string;
    researchMethodologyCompleted: "yes" | "no";
  }>;
  documents: Array<{
    id: string;
    literatureReview?: string;
    projectProposal?: string;
    progressReport?: string;
    finalThesisBook?: string;
    plagiarismReport?: string;
    aiDetectionReport?: string;
    presentationSlide?: string;
    poster?: string;
    plagiarismPercentage?: number;
    aiDetectionPercentage?: number;
  }>;
  obeMarks?: OBEMarks;
  createdAt?: string;
  updatedAt?: string;
}

export async function getAdminThesisGroupsApi(params?: {
  semesterId?: string;
  supervisorId?: string;
  supervisorName?: string;
  supervisorEmail?: string;
  proposedTitle?: string;
  thesisDomain?: string;
}): Promise<AdminThesisGroup[]> {
  try {
    const response = await API_SERVICE.get("/admin/thesis-groups", {
      params,
    });
    return response.data || [];
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Error fetching admin thesis groups:", axiosError.message);
    throw error;
  }
}

export async function getAdminThesisGroupApi(
  id: string,
): Promise<AdminThesisGroup> {
  try {
    const response = await API_SERVICE.get(`/admin/thesis-groups/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Error fetching admin thesis group:", axiosError.message);
    throw error;
  }
}
