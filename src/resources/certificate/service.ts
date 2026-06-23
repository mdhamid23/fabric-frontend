import {
  createCertificateApi,
  deleteCertificateApi,
  getCertificateByIdApi,
  getCertificatesApi,
  updateCertificateApi,
  verifyCertificateApi,
  verifyCertificateByTokenApi,
  revokeCertificateApi,
  getCertificateId,
  normalizeCertificate,
  Certificate,
  CertificatePayload,
  CertificateResponse,
  VerifyCertificatePayload,
  VerifyCertificateResponse,
  VerifyByTokenResponse,
  RevokeCertificatePayload,
  RevokeCertificateResponse,
} from "./api";

export type {
  Certificate,
  CertificatePayload,
  CertificateResponse,
  VerifyCertificatePayload,
  VerifyCertificateResponse,
  VerifyByTokenResponse,
  RevokeCertificatePayload,
  RevokeCertificateResponse,
};

// ============ Service Functions ============

/**
 * Get all certificates
 */
export const getCertificates = () => getCertificatesApi();

/**
 * Get a single certificate by ID
 */
export const getCertificateById = (id: string) => getCertificateByIdApi(id);

/**
 * Create a new certificate
 */
export const createCertificate = (payload: CertificatePayload) =>
  createCertificateApi(payload);

/**
 * Verify a certificate manually
 */
export const verifyCertificate = (payload: VerifyCertificatePayload) =>
  verifyCertificateApi(payload);

/**
 * Verify a certificate by token (QR code)
 */
export const verifyCertificateByToken = (token: string) =>
  verifyCertificateByTokenApi(token);

/**
 * Revoke a certificate by ID
 */
export const revokeCertificate = (
  id: string,
  payload: RevokeCertificatePayload,
) => revokeCertificateApi(id, payload);

/**
 * Update a certificate
 */
export const updateCertificate = (
  id: string,
  payload: Partial<CertificatePayload>,
) => updateCertificateApi(id, payload);

/**
 * Delete a certificate
 */
export const deleteCertificate = (id: string) => deleteCertificateApi(id);

/**
 * Helper to get certificate ID (either id or certificateId)
 */
export const getCertId = (certificate: Certificate) =>
  getCertificateId(certificate);

/**
 * Helper to normalize certificate data
 */
export const normalizeCert = (cert: any) => normalizeCertificate(cert);
