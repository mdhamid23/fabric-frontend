import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { z } from "zod";
import { iAxios } from "../interfaces/axios.interface";

type RetryableAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

// Helper to get token from localStorage
const getTokenFromStorage = (): string | null => {
  try {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("accessToken");
    return token || null;
  } catch (error) {
    console.error("Error reading token from localStorage:", error);
    return null;
  }
};

export const API_SERVICE = axios.create({
  baseURL: "/api/backend-proxy",
});

// Request interceptor for API_SERVICE to add token
API_SERVICE.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling 401 errors
API_SERVICE.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | RetryableAxiosRequestConfig
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // If it's a 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear invalid token
      try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      } catch (e) {
        // Ignore
      }

      // Redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

// Helper function for making API requests
export const getAxios = <T extends z.ZodTypeAny>(
  info: iAxios<any | FormData, any>,
  responseSchema: T | null = null,
): Promise<z.infer<T>> => {
  const { url, params = {}, data = {}, method = "get" } = info;

  let dataType = "application/json";

  if (data instanceof FormData) {
    dataType = "multipart/form-data";
  }

  const headers: Record<string, string> = {
    "Content-Type":
      dataType === "multipart/form-data"
        ? "multipart/form-data"
        : "application/json;charset=UTF-8",
  };

  // Add token if available
  const token = getTokenFromStorage();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return API_SERVICE.request({
    method,
    url,
    data,
    headers,
    params,
  }).then((response) => {
    if (!responseSchema) {
      return response.data;
    }

    return responseSchema.parse(response.data);
  });
};
