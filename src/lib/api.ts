const DEFAULT_API_BASE_URL = 'http://localhost:4000/api';

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

const ensureLeadingSlash = (path: string): string => (path.startsWith('/') ? path : `/${path}`);

export const buildApiUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${API_BASE_URL}${ensureLeadingSlash(path)}`;
};

const parseResponsePayload = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const buildHeaders = (init?: RequestInit): Headers => {
  const headers = new Headers(init?.headers);
  const hasBody = init?.body !== undefined && init.body !== null;
  const isFormData = typeof FormData !== 'undefined' && hasBody && init?.body instanceof FormData;

  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  return headers;
};

export async function apiFetch<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const requestInit: RequestInit = {
    ...init,
    headers: buildHeaders(init),
  };

  if (!requestInit.cache) {
    requestInit.cache = 'no-store';
  }

  const response = await fetch(buildApiUrl(path), requestInit);

  const payload = await parseResponsePayload(response);

  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null && 'message' in payload
      ? String((payload as Record<string, unknown>).message)
      : `API request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  return payload as TResponse;
}
