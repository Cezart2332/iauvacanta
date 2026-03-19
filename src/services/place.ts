import { apiClient } from '../lib/api';

export interface BackendPlace {
  id: number;
  title: string;
  description: string;
  photoUrl: string;
  stars: number;
  city: string;
  isApproved: boolean;
  ownerId: number;
  facilities: string[];
}

export interface CreatePlacePayload {
  title: string;
  description: string;
  photoUrl: string;
  stars: number;
  city: string;
  facilities: string[];
}

export const fetchPlaces = async (params?: {
  city?: string;
  stars?: number;
  facilities?: string[];
}): Promise<BackendPlace[]> => {
  const response = await apiClient.get<BackendPlace[]>('/place', { params });
  return response.data;
};

export const createPlace = async (payload: CreatePlacePayload): Promise<BackendPlace> => {
  const response = await apiClient.post<BackendPlace>('/place', payload);
  return response.data;
};

export const updatePlace = async (id: number, payload: CreatePlacePayload): Promise<BackendPlace> => {
  const response = await apiClient.put<BackendPlace>(`/place/${id}`, payload);
  return response.data;
};

export const deletePlace = async (id: number): Promise<void> => {
  await apiClient.delete(`/place/${id}`);
};

export const approvePlace = async (id: number, approved: boolean): Promise<BackendPlace> => {
  const response = await apiClient.patch<BackendPlace>(`/place/${id}/approval`, null, {
    params: { approved }
  });
  return response.data;
};

export const fetchPendingPlaces = async (): Promise<BackendPlace[]> => {
  const response = await apiClient.get<BackendPlace[]>('/place/pending');
  return response.data;
};
