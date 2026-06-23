// services/auth/api.ts
import { API_SERVICE, getAxios } from "@/config/axios-config";
import { AxiosError } from "axios";
import { z } from "zod";
import {
  setAuth,
  clearAuth,
  getCurrentUser,
  bearerToken,
} from "@/helpers/get-auth-user";

// ============ Types ============

export interface LoginPayload {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

// ============ Zod Schemas ============

const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  role: z.string(),
});

const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: userSchema,
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

// ============ API Functions ============

/**
 * Login user
 * POST /auth/login
 */
export const loginApi = async (
  payload: LoginPayload,
): Promise<LoginResponse> => {
  try {
    // Use API_SERVICE directly since we're going through the proxy
    const response = await API_SERVICE.post<LoginResponse>(
      "/auth/login",
      payload,
    );
    const data = loginResponseSchema.parse(response.data);

    // Store both token and user in localStorage using helper
    setAuth(data.accessToken, data.user);

    return data;
  } catch (error) {
    throw toAppError(error);
  }
};

/**
 * Logout user
 */
export const logoutApi = async (): Promise<void> => {
  try {
    // Call logout endpoint through proxy
    await API_SERVICE.post("/auth/logout");
    clearAuth();
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear local storage even if API call fails
    clearAuth();
  }
};

/**
 * Get current auth state
 */
export const getCurrentAuthState = (): any => {
  const user = getCurrentUser();
  const token = bearerToken();
  return {
    isAuthenticated: !!user && !!token,
    user,
  };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const user = getCurrentUser();
  const token = bearerToken();
  return !!user && !!token;
};

/**
 * Get current user
 */
export const getCurrentUserr = (): User | null => {
  return getCurrentUser();
};

/**
 * Get bearer token
 */
export const getBearerToken = (): string => {
  return bearerToken();
};
