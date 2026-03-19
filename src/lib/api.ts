import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

const DEFAULT_API_BASE_URL = 'https://localhost:7053/api';

const sanitizeBaseUrl = (value: string): string => {
  if (!value) {
    return DEFAULT_API_BASE_URL;
  }

  return value.endsWith('/') ? value.slice(0, -1) : value;
};

export const API_BASE_URL = sanitizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL);

export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

let refreshInFlight: Promise<void> | null = null;

const refreshSession = async (): Promise<void> => {
  if (!refreshInFlight) {
    refreshInFlight = axios
      .post(`${API_BASE_URL}/auth/refresh-token`, null, { withCredentials: true })
      .then(() => undefined)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  return refreshInFlight;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalConfig = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const requestUrl = originalConfig?.url ?? '';
    const isAuthRefreshRequest = requestUrl.includes('/auth/refresh-token');

    if (status === 401 && originalConfig && !originalConfig._retry && !isAuthRefreshRequest) {
      originalConfig._retry = true;

      try {
        await refreshSession();
        return apiClient.request(originalConfig);
      } catch {
        // Fall through and return the original auth error.
      }
    }

    return Promise.reject(error);
  }
);

const extractApiMessage = (error: AxiosError): string => {
  const responseData = error.response?.data;
  if (typeof responseData === 'string' && responseData.trim().length > 0) {
    return responseData;
  }

  if (typeof responseData === 'object' && responseData !== null && 'message' in responseData) {
    return String((responseData as { message?: string }).message ?? 'Request failed');
  }

  return error.message || 'Request failed';
};

export async function apiFetch<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const method = init?.method ?? 'GET';
  const requestConfig: AxiosRequestConfig = {
    url: path,
    method,
    data: init?.body,
    headers: init?.headers as Record<string, string> | undefined
  };

  try {
    const response = await apiClient.request<TResponse>(requestConfig);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(extractApiMessage(error), error.response?.status, error.response?.data);
    }

    throw new ApiError('Unexpected API error');
  }
}
