import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { isPublicPath } from "./publicPaths";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ── Cookies helpers ───────────────────────────────────────────
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

// ── Token management ─────────────────────────────────────────
// Access token lives in memory AND a short-lived cookie (for proxy reads)
// Refresh token lives in a cookie only

let accessToken: string | null = null;
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    // Also write to cookie so proxy.ts can read it on server-side navigation
    setCookie("access_token", token, 60 * 60); // 1h
  } else {
    deleteCookie("access_token");
  }
}

export function setRefreshToken(token: string | null) {
  if (token) {
    setCookie("refresh_token", token, 60 * 60 * 24 * 30); // 30 days
  } else {
    deleteCookie("refresh_token");
  }
}

export function getAccessToken() {
  return accessToken ?? getCookie("access_token");
}

export function getRefreshToken() {
  return getCookie("refresh_token");
}

// On cold start (page refresh), restore from cookie
if (typeof window !== "undefined") {
  const cookie = getCookie("access_token");
  if (cookie) accessToken = cookie;
}

// ── Intercepteur requête : injecte le Bearer token ────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = accessToken ?? getCookie("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Intercepteur réponse : refresh automatique sur 401 ────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't intercept auth endpoints — let the caller handle the error
    const url = originalRequest.url ?? "";
    if (url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/token/refresh")) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      setAccessToken(null);
      setRefreshToken(null);
      return handleAuthFailure(originalRequest, error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/v1/auth/token/refresh/`,
        { refresh: refreshToken },
        { withCredentials: true },
      );
      const newToken: string = data.access;
      setAccessToken(newToken);
      if (data.refresh) setRefreshToken(data.refresh);
      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch {
      setAccessToken(null);
      setRefreshToken(null);
      refreshQueue = [];
      return handleAuthFailure(originalRequest, error);
    } finally {
      isRefreshing = false;
    }
  },
);

// Sur une page publique, une session expirée ne doit pas bloquer la navigation :
// on relance la requête sans jeton (anonyme) au lieu de forcer une redirection vers /login.
function handleAuthFailure(
  originalRequest: InternalAxiosRequestConfig & { _retry?: boolean },
  error: AxiosError,
) {
  const onPublicPage = typeof window !== "undefined" && isPublicPath(window.location.pathname);
  if (!onPublicPage) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return Promise.reject(error);
  }
  originalRequest._retry = true;
  delete originalRequest.headers.Authorization;
  return api(originalRequest);
}
