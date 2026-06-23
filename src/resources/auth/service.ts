import {
  loginApi,
  logoutApi,
  getCurrentAuthState,
  isAuthenticated,
  getCurrentUserr,
  getBearerToken,
  LoginPayload,
  LoginResponse,
  User,
} from "./api";

export type { LoginPayload, LoginResponse, User };

// ============ Service Functions ============

/**
 * Login user
 */
export const login = (payload: LoginPayload) => loginApi(payload);

/**
 * Logout user
 */
export const logout = () => logoutApi();

/**
 * Get current auth state
 */
export const getAuthState = () => getCurrentAuthState();

/**
 * Check if user is authenticated
 */
export const checkAuth = () => isAuthenticated();

/**
 * Get current user
 */
export const getCurrentUser = () => getCurrentUserr();

/**
 * Get bearer token
 */
export const getToken = () => getBearerToken();
