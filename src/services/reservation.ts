import { apiClient } from '../lib/api';

export interface ReservationPayload {
  placeId: number;
  startDate: string;
  endDate: string;
}

export interface ReservationResponse {
  id: number;
  startDate: string;
  endDate: string;
  placeId: number;
  placeTitle: string;
  userId: number;
}

export const reservePlace = async (payload: ReservationPayload): Promise<ReservationResponse> => {
  const response = await apiClient.post<ReservationResponse>('/reservation', payload);
  return response.data;
};
