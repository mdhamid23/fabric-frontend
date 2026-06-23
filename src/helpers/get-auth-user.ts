// helpers/authHelper.ts

/**
 * Get the bearer token from localStorage
 */
export const bearerToken = (): string => {
  try {
    if (typeof window === "undefined") return "";
    const token = localStorage.getItem("accessToken");
    return token || "";
  } catch (error) {
    console.error("Error getting bearer token:", error);
    return "";
  }
};

/**
 * Get the current user from localStorage
 */
export const getCurrentUser = (): any => {
  try {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Get the current user's role
 */
export const getCurrentUserRole = (): string | null => {
  try {
    const user = getCurrentUser();
    return user?.role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  try {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");
    return !!(token && user);
  } catch (error) {
    return false;
  }
};

/**
 * Clear all auth data
 */
export const clearAuth = (): void => {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  } catch (error) {
    console.error("Error clearing auth:", error);
  }
};

/**
 * Set auth data
 */
export const setAuth = (accessToken: string, user: any): void => {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Error setting auth:", error);
  }
};

/**
 * Logout user
 */
export const logout = (): void => {
  clearAuth();
  // Redirect to login
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};
