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

type AuthCookieResponse = {
  authenticated: boolean;
  user?: unknown;
};

export const API_SERVICE = axios.create({
  baseURL: "/api/backend-proxy",
  withCredentials: true,
});

export const AUTH_SERVICE = axios.create({
  baseURL: "/auth-api",
  withCredentials: true,
});

let refreshSessionPromise: Promise<boolean> | null = null;

async function refreshCookieSession(): Promise<boolean> {
  if (!refreshSessionPromise) {
    refreshSessionPromise = fetch("/api/auth/cookie", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          return false;
        }

        const session = (await response.json()) as AuthCookieResponse;

        return Boolean(session.authenticated);
      })
      .catch(() => false)
      .finally(() => {
        refreshSessionPromise = null;
      });
  }

  return refreshSessionPromise;
}

function shouldRetryRequest(error: AxiosError): boolean {
  const originalRequest = error.config as
    | RetryableAxiosRequestConfig
    | undefined;

  if (!originalRequest) return false;
  if (originalRequest._retry) return false;
  if (error.response?.status !== 401) return false;

  return true;
}

API_SERVICE.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | RetryableAxiosRequestConfig
      | undefined;

    if (!shouldRetryRequest(error) || !originalRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshed = await refreshCookieSession();

    if (!refreshed) {
      return Promise.reject(error);
    }

    return API_SERVICE.request(originalRequest);
  },
);

export const getAxios = <T extends z.ZodTypeAny>(
  info: iAxios<any | FormData, any>,
  responseSchema: T | null = null,
): Promise<z.infer<T>> => {
  const { url, params = {}, data = {}, method = "get" } = info;

  const headers: Record<string, string> = {};

  if (!(data instanceof FormData)) {
    headers["Content-Type"] = "application/json;charset=UTF-8";
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
