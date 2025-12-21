import { apiFetch } from '../lib/api';

export interface LegacyPensiune {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  ownerName: string | null;
  phone: string | null;
  email: string | null;
  rooms: number | null;
  stars: number | null;
  rating: number | null;
  location: {
    countyId: number | null;
    countyName: string | null;
    countySlug: string | null;
    localityId: number | null;
    localityName: string | null;
  };
  coordinates: {
    lat: number | null;
    lng: number | null;
  };
  facilityIds: string[];
  price: {
    currency: 'RON';
    min: number | null;
    max: number | null;
  };
  photos: string[];
  type: {
    id: number | null;
    label: string | null;
    slug: string | null;
  };
  updatedAt: string;
}

export interface FetchPensiuniParams {
  limit?: number;
  countySlug?: string;
}

export interface PensiuniResponse {
  data: LegacyPensiune[];
  meta: {
    total: number;
    limit: number | null;
    filteredByCounty: string | null;
  };
}

const buildQuery = (params?: FetchPensiuniParams): string => {
  const search = new URLSearchParams();

  if (params?.limit !== undefined) {
    search.set('limit', String(params.limit));
  }

  if (params?.countySlug) {
    search.set('countySlug', params.countySlug);
  }

  search.set('_', Date.now().toString());

  const queryString = search.toString();
  return queryString ? `/pensiuni?${queryString}` : '/pensiuni';
};

export const fetchVisiblePensiuni = async (params?: FetchPensiuniParams): Promise<PensiuniResponse> => {
  return apiFetch<PensiuniResponse>(buildQuery(params));
};
