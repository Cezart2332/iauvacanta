import { apiClient } from '../lib/api';

export interface BackendProfile {
  description: string;
  profilePictureUrl: string;
}

export interface BackendUser {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  profile: BackendProfile | null;
}

export interface AuthResponse {
  user: BackendUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload);
  return response.data;
};

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', payload);
  return response.data;
};

export const refreshToken = async (): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/refresh-token');
  return response.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};
