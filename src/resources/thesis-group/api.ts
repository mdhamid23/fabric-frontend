import { API_SERVICE } from "@/config/axios-config";
import { ThesisGroup as AdminThesisGroup } from "@/components/Admin/types";
import { ThesisStatus } from "@/components/Supervisor/types";
import { AxiosError } from "axios";

interface SupervisorGroupStudent {
  studentId: string;
  name: string;
  cgpa: string;
  primaryEmail: string;
  secondaryEmail?: string;
  phoneNo: string;
  creditCompleted: string;
  creditTakeWithThesis?: string;
  researchMethodologyCompleted: "yes" | "no";
}

interface SupervisorGroupResponse {
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
  literatureReview?: string;
  projectProposal?: string;
  numberOfStudents: number;
  acceptTerms: boolean;
  students: SupervisorGroupStudent[];
  status: ThesisStatus;
}

export interface CreateSupervisorGroupPayload {
  semesterId: string;
  supervisorId: string;
  supervisorName: string;
  supervisorEmail: string;
  proposedTitle: string;
  thesisDomain: string;
  shortDescription: string;
  literatureReview?: string;
  projectProposal?: string;
  numberOfStudents: number;
  students: SupervisorGroupStudent[];
  acceptTerms: boolean;
}

export interface CreateSupervisorGroupRequest {
  payload: CreateSupervisorGroupPayload;
  literatureReviewFile?: File;
  projectProposalFile?: File;
}

export interface UpdateSupervisorGroupRequest {
  id: string;
  payload: Partial<CreateSupervisorGroupPayload>;
  literatureReviewFile?: File;
  projectProposalFile?: File;
}

export interface UploadGroupEvidenceRequest {
  groupId: string;
  semesterId?: string;
  plagiarismPercentage?: string;
  aiDetectionPercentage?: string;
  files: {
    progressReport?: File;
    finalThesisBook?: File;
    plagiarismReport?: File;
    aiDetectionReport?: File;
    presentationSlide?: File;
    poster?: File;
  };
}

export interface GroupDocument {
  id: string;
  thesisGroupId: string;
  semesterId: string;
  literatureReview?: string | null;
  projectProposal?: string | null;
  progressReport?: string | null;
  finalThesisBook?: string | null;
  plagiarismReport?: string | null;
  aiDetectionReport?: string | null;
  presentationSlide?: string | null;
  poster?: string | null;
  plagiarismPercentage?: number;
  aiDetectionPercentage?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ThesisGroupStatus =
  | "submitted"
  | "action_needed"
  | "resubmitted"
  | "completed";

export type RegistrationStatus = "completed" | "pending";

interface AdminThesisGroupResponse {
  id: string;
  semesterId: string;
  classId?: string | null;
  globalGroupSerial?: string | null;
  supervisorGroup?: string | null;
  externalId?: string | null;
  externalName?: string | null;
  thesisManagementTeamRemark?: string | null;
  supervisorRemark?: string | null;
  supervisorId: string;
  supervisorName: string;
  supervisorEmail: string;
  proposedTitle: string;
  thesisDomain: string;
  shortDescription: string;
  numberOfStudents: number;
  acceptTerms: boolean;
  students?: Array<{
    studentId: string;
    name: string;
  }>;
  documents?: Array<{
    finalThesisBook?: string | null;
  }>;
  status?: ThesisGroupStatus | "action-needed" | "complete" | null;
  registrationCompleted?: boolean | null;
}

export interface ThesisGroup {
  id: string;
  serial: string;
  classId: string;
  groupNo: string;
  supervisorId: string;
  supervisorName: string;
  extId: string;
  students: {
    id: string;
    name: string;
  }[];
  thesisMgmtRemark?: string;
  status: ThesisGroupStatus;
  remark?: string;
  registrationCompleted: boolean;
  registrationStatus: RegistrationStatus;
  isEdited?: boolean;
  semesterId?: string;
  name?: string;
  domain?: string;
}

export interface UpdateAdminThesisGroupPayload {
  classId?: string;
  externalId?: string;
  thesisManagementTeamRemark?: string;
  supervisorRemark?: string;
}

export interface SupervisorDashboardStats {
  totalGroups: number;
  totalStudents: number;
  completedGroups: number;
  pendingRequests: number;
}

export interface GroupsBySemesterItem {
  semesterId: string;
  semesterName: string;
  count: number;
  students: number;
  completed: number;
  ongoing: number;
}

export interface SupervisorRecentActivity {
  id: string;
  type:
    | "group_created"
    | "group_updated"
    | "evidence_uploaded"
    | "approval_request";
  title: string;
  description: string;
  timestamp: string;
  groupNo?: string;
  status: "success" | "warning" | "info";
}

export interface SupervisorDashboardResponse {
  stats: SupervisorDashboardStats;
  groupsBySemester: GroupsBySemesterItem[];
  recentActivities: SupervisorRecentActivity[];
}

export interface SupervisorApprovalRequest {
  id: string;
  supervisorId: string;
  semesterId?: string | null;
  type: "additional_groups" | "extension" | "other";
  status: "pending" | "approved" | "rejected";
  requestDate: string;
  responseDate?: string | null;
  message: string;
  groupCount?: number | null;
  reason?: string | null;
  attachments: string[];
}

export interface CreateSupervisorApprovalRequestPayload {
  supervisorId: string;
  semesterId?: string;
  type?: "additional_groups" | "extension" | "other";
  message: string;
  groupCount?: number;
  reason?: string;
  attachments?: File[];
}

export interface GetAdminApprovalRequestsOptions {
  status?: "pending" | "approved" | "rejected";
  semesterId?: string;
}

export interface RespondAdminApprovalRequestPayload {
  status: "approved" | "rejected";
}

const toAppError = (error: unknown) => {
  const axiosError = error as AxiosError<{ message?: string | string[] }>;
  const message = axiosError.response?.data?.message;

  if (Array.isArray(message)) {
    return new Error(message.join(", "));
  }

  if (typeof message === "string") {
    return new Error(message);
  }

  return new Error("Something went wrong. Please try again.");
};

const deriveStatus = (group: SupervisorGroupResponse): ThesisStatus => {
  return group.status;
};

const toUiGroup = (group: SupervisorGroupResponse): any => ({
  id: group.id,
  semesterId: group.semesterId,
  supervisorId: group.supervisorId,
  name: group.proposedTitle,
  domain: group.thesisDomain,
  groupNo: `Thesis [BSCS][G${group.globalGroupSerial ?? "-"}]`,
  supervisorGroup: group.supervisorGroup,
  status: deriveStatus(group),
});

const toAdminStatus = (group: AdminThesisGroupResponse): ThesisGroupStatus => {
  if (group.status === "submitted") {
    return "submitted";
  }

  if (group.status === "action_needed") {
    return "action_needed";
  }

  if (group.status === "resubmitted") {
    return "resubmitted";
  }

  if (group.status === "completed") {
    return "completed";
  }

  // Legacy fallback support
  if (group.status === "action-needed") {
    return "action_needed";
  }

  if (group.status === "complete") {
    return "completed";
  }

  if (group.registrationCompleted === true) {
    return "completed";
  }

  if (group.thesisManagementTeamRemark?.trim()) {
    return "action_needed";
  }

  return "submitted";
};

const toAdminUiGroup = (group: AdminThesisGroupResponse): ThesisGroup => {
  const status = toAdminStatus(group);
  const registrationCompleted =
    group.registrationCompleted === true || status === "completed";

  return {
    id: group.id,

    classId: group.classId ?? "",

    groupNo: group.supervisorGroup
      ? `[BSCS][Thesis][G${group.globalGroupSerial ?? "-"}]`
      : `Thesis [BSCS][G${group.globalGroupSerial ?? "-"}]`,

    supervisorId: group.supervisorId,
    supervisorName: group.supervisorName,

    extId: group.externalId ?? "",

    students: (group.students ?? []).map((student) => ({
      id: student.studentId,
      name: student.name,
    })),

    status,

    registrationCompleted,

    registrationStatus: registrationCompleted ? "completed" : "pending",

    remark: group.supervisorRemark ?? "",

    thesisMgmtRemark: group.thesisManagementTeamRemark ?? "",

    isEdited: false,

    serial: group.globalGroupSerial ?? "-",
  };
};

export const getSupervisorGroupsApi = async (options?: {
  supervisorId?: string;
  semesterId?: string;
}): Promise<ThesisGroup[]> => {
  try {
    const { supervisorId, semesterId } = options ?? {};
    const params: Record<string, string> = {};

    if (supervisorId) {
      params.supervisorId = supervisorId;
    }

    if (semesterId) {
      params.semesterId = semesterId;
    }

    const { data } = await API_SERVICE.get<SupervisorGroupResponse[]>(
      "/supervisor/groups",
      {
        params: Object.keys(params).length ? params : undefined,
      },
    );

    return data.map(toUiGroup);
  } catch (error) {
    throw toAppError(error);
  }
};

export const getAdminThesisGroupsApi = async (options?: {
  semesterId?: string;
}): Promise<AdminThesisGroup[]> => {
  try {
    const params: Record<string, string> = {};

    if (options?.semesterId) {
      params.semesterId = options.semesterId;
    }

    const { data } = await API_SERVICE.get<AdminThesisGroupResponse[]>(
      "/thesis-groups",
      {
        params: Object.keys(params).length ? params : undefined,
      },
    );

    return data.map(toAdminUiGroup);
  } catch (error) {
    throw toAppError(error);
  }
};

export const updateAdminThesisGroupApi = async (options: {
  id: string;
  payload: UpdateAdminThesisGroupPayload;
}): Promise<void> => {
  try {
    await API_SERVICE.patch(`/thesis-groups/${options.id}`, options.payload);
  } catch (error) {
    throw toAppError(error);
  }
};

export const createSupervisorGroupApi = async (
  request: CreateSupervisorGroupRequest,
): Promise<void> => {
  try {
    const formData = new FormData();
    const { payload, literatureReviewFile, projectProposalFile } = request;

    formData.append("semesterId", payload.semesterId);
    formData.append("supervisorId", payload.supervisorId);
    formData.append("supervisorName", payload.supervisorName);
    formData.append("supervisorEmail", payload.supervisorEmail);
    formData.append("proposedTitle", payload.proposedTitle);
    formData.append("thesisDomain", payload.thesisDomain);
    formData.append("shortDescription", payload.shortDescription);
    formData.append("numberOfStudents", String(payload.numberOfStudents));
    formData.append("acceptTerms", String(payload.acceptTerms));
    formData.append("students", JSON.stringify(payload.students));

    if (literatureReviewFile) {
      formData.append("literatureReview", literatureReviewFile);
    }

    if (projectProposalFile) {
      formData.append("projectProposal", projectProposalFile);
    }

    await API_SERVICE.post("/supervisor/create-group", formData);
  } catch (error) {
    throw toAppError(error);
  }
};

export const updateSupervisorGroupApi = async (
  request: UpdateSupervisorGroupRequest,
): Promise<void> => {
  try {
    const formData = new FormData();
    const { id, payload, literatureReviewFile, projectProposalFile } = request;

    if (payload.semesterId !== undefined) {
      formData.append("semesterId", payload.semesterId);
    }

    if (payload.supervisorId !== undefined) {
      formData.append("supervisorId", payload.supervisorId);
    }

    if (payload.supervisorName !== undefined) {
      formData.append("supervisorName", payload.supervisorName);
    }

    if (payload.supervisorEmail !== undefined) {
      formData.append("supervisorEmail", payload.supervisorEmail);
    }

    if (payload.proposedTitle !== undefined) {
      formData.append("proposedTitle", payload.proposedTitle);
    }

    if (payload.thesisDomain !== undefined) {
      formData.append("thesisDomain", payload.thesisDomain);
    }

    if (payload.shortDescription !== undefined) {
      formData.append("shortDescription", payload.shortDescription);
    }

    if (payload.numberOfStudents !== undefined) {
      formData.append("numberOfStudents", String(payload.numberOfStudents));
    }

    if (payload.acceptTerms !== undefined) {
      formData.append("acceptTerms", String(payload.acceptTerms));
    }

    if (payload.students !== undefined) {
      formData.append("students", JSON.stringify(payload.students));
    }

    if (literatureReviewFile) {
      formData.append("literatureReview", literatureReviewFile);
    }

    if (projectProposalFile) {
      formData.append("projectProposal", projectProposalFile);
    }

    await API_SERVICE.patch(`/supervisor/groups/${id}`, formData);
  } catch (error) {
    throw toAppError(error);
  }
};

export const uploadGroupEvidenceApi = async (
  request: UploadGroupEvidenceRequest,
): Promise<void> => {
  try {
    const formData = new FormData();

    if (request.semesterId) {
      formData.append("semesterId", request.semesterId);
    }

    if (request.plagiarismPercentage) {
      formData.append("plagiarismPercentage", request.plagiarismPercentage);
    }

    if (request.aiDetectionPercentage) {
      formData.append("aiDetectionPercentage", request.aiDetectionPercentage);
    }

    Object.entries(request.files).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });

    await API_SERVICE.post(
      `/supervisor/groups/${request.groupId}/evidences`,
      formData,
    );
  } catch (error) {
    throw toAppError(error);
  }
};

export const getGroupDocumentsApi = async (options: {
  groupId: string;
  semesterId?: string;
}): Promise<GroupDocument | null> => {
  try {
    const params: Record<string, string> = {};
    if (options.semesterId) {
      params.semesterId = options.semesterId;
    }

    const { data } = await API_SERVICE.get<GroupDocument | null>(
      `/supervisor/groups/${options.groupId}/documents`,
      {
        params: Object.keys(params).length ? params : undefined,
      },
    );

    return data;
  } catch (error) {
    throw toAppError(error);
  }
};

export const removeGroupDocumentApi = async (options: {
  groupId: string;
  documentType: string;
  semesterId?: string;
}): Promise<void> => {
  try {
    const params: Record<string, string> = {};
    if (options.semesterId) {
      params.semesterId = options.semesterId;
    }

    await API_SERVICE.delete(
      `/supervisor/groups/${options.groupId}/documents/${options.documentType}`,
      {
        params: Object.keys(params).length ? params : undefined,
      },
    );
  } catch (error) {
    throw toAppError(error);
  }
};

export const getSupervisorDashboardApi = async (options?: {
  supervisorId?: string;
  semesterId?: string;
}): Promise<SupervisorDashboardResponse> => {
  try {
    const params: Record<string, string> = {};
    if (options?.supervisorId) {
      params.supervisorId = options.supervisorId;
    }

    if (options?.semesterId) {
      params.semesterId = options.semesterId;
    }

    const { data } = await API_SERVICE.get<SupervisorDashboardResponse>(
      "/supervisor/dashboard",
      {
        params: Object.keys(params).length ? params : undefined,
      },
    );

    return data;
  } catch (error) {
    throw toAppError(error);
  }
};

export const getSupervisorApprovalRequestsApi = async (options?: {
  supervisorId?: string;
  semesterId?: string;
}): Promise<SupervisorApprovalRequest[]> => {
  try {
    const params: Record<string, string> = {};
    if (options?.supervisorId) {
      params.supervisorId = options.supervisorId;
    }

    if (options?.semesterId) {
      params.semesterId = options.semesterId;
    }

    const { data } = await API_SERVICE.get<SupervisorApprovalRequest[]>(
      "/supervisor/approval-requests",
      {
        params: Object.keys(params).length ? params : undefined,
      },
    );

    return data;
  } catch (error) {
    throw toAppError(error);
  }
};

export const createSupervisorApprovalRequestApi = async (
  payload: CreateSupervisorApprovalRequestPayload,
): Promise<SupervisorApprovalRequest> => {
  try {
    const formData = new FormData();

    formData.append("supervisorId", payload.supervisorId);
    formData.append("message", payload.message);

    if (payload.semesterId) {
      formData.append("semesterId", payload.semesterId);
    }

    if (payload.type) {
      formData.append("type", payload.type);
    }

    if (payload.groupCount !== undefined) {
      formData.append("groupCount", String(payload.groupCount));
    }

    if (payload.reason) {
      formData.append("reason", payload.reason);
    }

    for (const attachment of payload.attachments ?? []) {
      formData.append("attachments", attachment);
    }

    const { data } = await API_SERVICE.post<SupervisorApprovalRequest>(
      "/supervisor/approval-requests",
      formData,
    );

    return data;
  } catch (error) {
    throw toAppError(error);
  }
};

export const getAdminApprovalRequestsApi = async (
  options?: GetAdminApprovalRequestsOptions,
): Promise<SupervisorApprovalRequest[]> => {
  try {
    const params: Record<string, string> = {};

    if (options?.status) {
      params.status = options.status;
    }

    if (options?.semesterId) {
      params.semesterId = options.semesterId;
    }

    const { data } = await API_SERVICE.get<SupervisorApprovalRequest[]>(
      "/admin/approval-requests",
      {
        params: Object.keys(params).length ? params : undefined,
      },
    );

    return data;
  } catch (error) {
    throw toAppError(error);
  }
};

export const respondAdminApprovalRequestApi = async (
  requestId: string,
  payload: RespondAdminApprovalRequestPayload,
): Promise<SupervisorApprovalRequest> => {
  try {
    const { data } = await API_SERVICE.patch<SupervisorApprovalRequest>(
      `/admin/approval-requests/${requestId}/respond`,
      payload,
    );

    return data;
  } catch (error) {
    throw toAppError(error);
  }
};

export interface SupervisorGroupDetailsResponse {
  id: string;
  semesterId: string;
  supervisorId: string;
  supervisorName: string;
  supervisorEmail: string;
  proposedTitle: string;
  thesisDomain: string;
  shortDescription: string;
  numberOfStudents: number;
  acceptTerms: boolean;
  status: ThesisGroupStatus;
  thesisManagementTeamRemark?: string | null;
  supervisorRemark?: string | null;
  students: Array<{
    studentId: string;
    name: string;
    cgpa: string;
    primaryEmail: string;
    secondaryEmail?: string | null;
    phoneNo: string;
    creditCompleted: string;
    creditTakeWithThesis?: string | null;
    researchMethodologyCompleted: "yes" | "no";
  }>;
}

export const getSupervisorGroupByIdApi = async (
  id: string,
): Promise<SupervisorGroupDetailsResponse> => {
  const { data } = await API_SERVICE.get<SupervisorGroupDetailsResponse>(
    `/thesis-groups/${id}`,
  );

  return data;
};

export const resubmitSupervisorGroupApi = async ({
  id,
  payload,
  literatureReviewFile,
  projectProposalFile,
}: {
  id: string;
  payload: unknown;
  literatureReviewFile?: File;
  projectProposalFile?: File;
}) => {
  const formData = new FormData();

  formData.append("payload", JSON.stringify(payload));

  if (literatureReviewFile) {
    formData.append("literatureReview", literatureReviewFile);
  }

  if (projectProposalFile) {
    formData.append("projectProposal", projectProposalFile);
  }

  const { data } = await API_SERVICE.patch(
    `/thesis-groups/${id}/supervisor-resubmit`,
    formData,
  );

  return data;
};
