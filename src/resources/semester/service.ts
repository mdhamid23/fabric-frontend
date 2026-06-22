import {
  createSemesterApi,
  deleteSemesterApi,
  getSemestersApi,
  Semester,
  SemesterPayload,
  updateSemesterApi,
} from "./api";

export type { Semester, SemesterPayload };

export const getSemesters = () => getSemestersApi();

export const createSemester = (payload: SemesterPayload) =>
  createSemesterApi(payload);

export const updateSemesterById = (id: string, payload: SemesterPayload) =>
  updateSemesterApi(id, payload);

export const deleteSemesterById = (id: string) => deleteSemesterApi(id);
