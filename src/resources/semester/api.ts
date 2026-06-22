import { API_SERVICE } from "@/config/axios-config";
import { AxiosError } from "axios";

export interface SemesterPayload {
  semesterName: string;
  groupCreationStart: string;
  groupCreationEnd: string;
  midEvidenceStart: string;
  midEvidenceEnd: string;
  finalEvidenceStart: string;
  finalEvidenceEnd: string;
}

export interface Semester extends SemesterPayload {
  id: string;
}

type SemesterListResponse = Semester[] | { items?: Semester[] };

const normalizeDateValue = (dateString: string) => dateString.slice(0, 10);

const normalizeSemester = (semester: Semester): Semester => ({
  ...semester,
  groupCreationStart: normalizeDateValue(semester.groupCreationStart),
  groupCreationEnd: normalizeDateValue(semester.groupCreationEnd),
  midEvidenceStart: normalizeDateValue(semester.midEvidenceStart),
  midEvidenceEnd: normalizeDateValue(semester.midEvidenceEnd),
  finalEvidenceStart: normalizeDateValue(semester.finalEvidenceStart),
  finalEvidenceEnd: normalizeDateValue(semester.finalEvidenceEnd),
});

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

export const getSemestersApi = async (): Promise<Semester[]> => {
  try {
    const { data } = await API_SERVICE.get<SemesterListResponse>("/semesters");
    const semesters = Array.isArray(data) ? data : (data?.items ?? []);
    return semesters.map(normalizeSemester);
  } catch (error) {
    throw toAppError(error);
  }
};

export const createSemesterApi = async (
  payload: SemesterPayload,
): Promise<Semester> => {
  try {
    const { data } = await API_SERVICE.post<Semester>("/semesters", payload);
    return normalizeSemester(data);
  } catch (error) {
    throw toAppError(error);
  }
};

export const updateSemesterApi = async (
  id: string,
  payload: SemesterPayload,
): Promise<Semester> => {
  try {
    const { data } = await API_SERVICE.patch<Semester>(
      `/semesters/${id}`,
      payload,
    );
    return normalizeSemester(data);
  } catch (error) {
    throw toAppError(error);
  }
};

export const deleteSemesterApi = async (id: string): Promise<void> => {
  try {
    await API_SERVICE.delete(`/semesters/${id}`);
  } catch (error) {
    throw toAppError(error);
  }
};
