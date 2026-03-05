import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL =
  typeof window !== 'undefined'
    ? (window as Record<string, unknown>).__API_URL__ || 'http://localhost:58000'
    : 'http://localhost:58000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL as string,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

let tokenGetter: () => string | null = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('access_token');
  }
  return null;
};

let onAuthFailure: () => void = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export function configureAuth(options: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) {
  tokenGetter = options.getToken;
  onAuthFailure = options.onUnauthorized;
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenGetter();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      onAuthFailure();
    }
    return Promise.reject(error);
  },
);
