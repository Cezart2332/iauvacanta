import { apiFetch } from '../lib/api';

export type LegacyUser = {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  registerDate: string;
  visible: boolean;
  displayOrder: number;
  updatedAt: string;
};

type LegacyAuthUserEnvelope = {
  data: {
    user: LegacyUser;
  };
};

export type LegacyLoginResponse = LegacyAuthUserEnvelope & {
  meta: {
    authenticatedAt: string;
    strategy: string;
  };
};

export type LegacyRegisterResponse = LegacyAuthUserEnvelope & {
  meta: {
    registeredAt: string;
    strategy: string;
  };
};

export type LegacyRegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
};

export const loginWithLegacyCredentials = async (email: string, password: string): Promise<LegacyLoginResponse> => {
  return apiFetch<LegacyLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

export const registerLegacyAccount = async (payload: LegacyRegisterPayload): Promise<LegacyRegisterResponse> => {
  return apiFetch<LegacyRegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
};
