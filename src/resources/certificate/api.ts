import { API_SERVICE, getAxios } from "@/config/axios-config";
import { AxiosError } from "axios";
import { z } from "zod";

// ============ Types ============

export interface CertificatePayload {
  studentName: string;
  rollNumber: string;
  registrationNumber: string;
  institute: string;
  examName: string;
  result: string;
  passingYear: string;
  board: string;
}

export interface Certificate {
  id: string;
  certificateId?: string;
  studentName: string;
  rollNumber: string;
  registrationNumber: string;
  institute: string;
  examName: string;
  result: string;
  passingYear: string;
  board: string;
  qrCodeToken?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  qrCodePath?: string | null;
  blockchainTxId?: string | null;
  blockchainBlockNumber?: string | null;
  blockchainTimestamp?: string | null;
  issuedBy?: string | null;
  issuedAt?: string | null;
  revokedBy?: string | null;
  revokedAt?: string | null;
  revocationReason?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  metadata?: any;
}

export interface CertificateResponse {
  certificateId: string;
  studentName: string;
  examName: string;
  result: string;
  board: string;
  passingYear: string;
  status: string;
  qrToken: string;
  issuedAt: string;
}

export interface VerifyCertificatePayload {
  rollNumber: string;
  registrationNumber: string;
  passingYear: string;
}

export interface VerifyCertificateResponse {
  message: string;
  result: "AUTHENTIC" | "NOT_AUTHENTIC" | string;
  certificate?: Certificate;
}

export interface VerifyByTokenResponse {
  message: string;
  result: "AUTHENTIC" | "NOT_AUTHENTIC" | string;
  certificate?: Certificate;
}

export interface RevokeCertificatePayload {
  reason: string;
}

export interface RevokeCertificateResponse {
  certificateHash: string;
  certificateId: string;
  issueTimestamp: string;
  issuerOrg: string;
  revocationReason: string;
  revokedAt: string;
  status: string;
}

// ============ Zod Schemas ============

// Schema for full certificate
const certificateSchema = z.object({
  id: z.string(),
  studentName: z.string(),
  rollNumber: z.string(),
  registrationNumber: z.string(),
  institute: z.string(),
  examName: z.string(),
  result: z.string(),
  passingYear: z.string(),
  board: z.string(),
  qrCodeToken: z.string().optional(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  qrCodePath: z.string().nullable().optional(),
  blockchainTxId: z.string().nullable().optional(),
  blockchainBlockNumber: z.string().nullable().optional(),
  blockchainTimestamp: z.string().nullable().optional(),
  issuedBy: z.string().nullable().optional(),
  issuedAt: z.string().nullable().optional(),
  revokedBy: z.string().nullable().optional(),
  revokedAt: z.string().nullable().optional(),
  revocationReason: z.string().nullable().optional(),
  createdBy: z.string().nullable().optional(),
  updatedBy: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
});

// Schema for the create certificate response
const certificateResponseSchema = z.object({
  certificateId: z.string(),
  studentName: z.string(),
  examName: z.string(),
  result: z.string(),
  board: z.string(),
  passingYear: z.string(),
  status: z.string(),
  qrToken: z.string(),
  issuedAt: z.string(),
});

// Schema for verification response (manual)
const verifyResponseSchema = z.object({
  message: z.string(),
  result: z.string(),
  certificate: certificateSchema.optional(),
});

// Schema for verification by token response
const verifyByTokenResponseSchema = z.object({
  message: z.string(),
  result: z.string(),
  certificate: certificateSchema.optional(),
});

// Schema for revoke response
const revokeResponseSchema = z.object({
  certificateHash: z.string(),
  certificateId: z.string(),
  issueTimestamp: z.string(),
  issuerOrg: z.string(),
  revocationReason: z.string(),
  revokedAt: z.string(),
  status: z.string(),
});

// ============ Helper Functions ============

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

export const getCertificateId = (certificate: Certificate): string => {
  return certificate.id || certificate.certificateId || "";
};

export const normalizeCertificate = (cert: any): Certificate => {
  return {
    ...cert,
    id: cert.id || cert.certificateId,
  };
};

// ============ API Functions ============

/**
 * Get all certificates
 * GET /certificates
 */
export const getCertificatesApi = async (): Promise<Certificate[]> => {
  try {
    const data = await getAxios(
      {
        method: "GET",
        url: "/certificates",
      },
      z.array(certificateSchema),
    );
    return data;
  } catch (error) {
    throw toAppError(error);
  }
};

/**
 * Get a single certificate by ID
 * GET /certificates/:id
 */
export const getCertificateByIdApi = async (
  id: string,
): Promise<Certificate> => {
  try {
    const data = await getAxios(
      {
        method: "GET",
        url: `/certificates/${id}`,
      },
      certificateSchema,
    );
    return data;
  } catch (error) {
    throw toAppError(error);
  }
};

/**
 * Verify a certificate by token (QR code token)
 * GET /certificates/:token/verify
 */
export const verifyCertificateByTokenApi = async (
  token: string,
): Promise<VerifyByTokenResponse> => {
  try {
    const data = await getAxios(
      {
        method: "GET",
        url: `/certificates/${token}/verify`,
      },
      verifyByTokenResponseSchema,
    );
    return data;
  } catch (error) {
    throw toAppError(error);
  }
};

/**
 * Create a new certificate
 * POST /certificates
 */
export const createCertificateApi = async (
  payload: CertificatePayload,
): Promise<CertificateResponse> => {
  try {
    const data = await getAxios(
      {
        method: "POST",
        url: "/certificates",
        data: payload,
      },
      certificateResponseSchema,
    );
    return data;
  } catch (error) {
    throw toAppError(error);
  }
};

/**
 * Verify a certificate manually
 * POST /certificates/verify
 */
export const verifyCertificateApi = async (
  payload: VerifyCertificatePayload,
): Promise<VerifyCertificateResponse> => {
  try {
    const data = await getAxios(
      {
        method: "POST",
        url: "/certificates/verify",
        data: payload,
      },
      verifyResponseSchema,
    );
    return data;
  } catch (error) {
    throw toAppError(error);
  }
};

/**
 * Revoke a certificate
 * POST /certificates/:id/revoke
 */
export const revokeCertificateApi = async (
  id: string,
  payload: RevokeCertificatePayload,
): Promise<RevokeCertificateResponse> => {
  try {
    const data = await getAxios(
      {
        method: "POST",
        url: `/certificates/${id}/revoke`,
        data: payload,
      },
      revokeResponseSchema,
    );
    return data;
  } catch (error) {
    throw toAppError(error);
  }
};

/**
 * Update a certificate
 * PATCH /certificates/:id
 */
export const updateCertificateApi = async (
  id: string,
  payload: Partial<CertificatePayload>,
): Promise<Certificate> => {
  try {
    const data = await getAxios(
      {
        method: "PATCH",
        url: `/certificates/${id}`,
        data: payload,
      },
      certificateSchema,
    );
    return data;
  } catch (error) {
    throw toAppError(error);
  }
};

/**
 * Delete a certificate
 * DELETE /certificates/:id
 */
export const deleteCertificateApi = async (id: string): Promise<void> => {
  try {
    await getAxios({
      method: "DELETE",
      url: `/certificates/${id}`,
    });
  } catch (error) {
    throw toAppError(error);
  }
};
