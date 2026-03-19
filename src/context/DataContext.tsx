import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { counties, type County } from '../mock/counties';
import {
  type Facility,
  type Property,
  type PropertyType,
  properties as fallbackProperties
} from '../mock/properties';
import {
  createPlace,
  deletePlace,
  fetchPlaces,
  updatePlace,
  type BackendPlace
} from '../services/place';

interface FilterOptions {
  type?: PropertyType | '';
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  facilities?: Facility[];
}

type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'name';

interface DataContextType {
  properties: Property[];
  counties: County[];
  isLoading: boolean;
  error: string | null;
  refreshProperties: () => Promise<void>;
  getPropertyById: (id: string) => Property | undefined;
  getPropertiesByCounty: (judetSlug: string) => Property[];
  getPropertiesByOwner: (ownerId: string) => Property[];
  filterProperties: (judetSlug: string, filters: FilterOptions) => Property[];
  sortProperties: (properties: Property[], sortBy: SortOption) => Property[];
  addProperty: (property: Omit<Property, 'id'>) => Promise<Property>;
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  getCountyBySlug: (slug: string) => County | undefined;
  searchProperties: (query: string) => Property[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const KNOWN_FACILITIES = new Set<Facility>([
  'wifi',
  'parcare',
  'mic-dejun',
  'piscină',
  'restaurant',
  'spa',
  'aer-conditionat',
  'animale',
  'fitness',
  'room-service',
  'bar',
  'terasă',
  'grătar',
  'jacuzzi',
  'saună'
]);

const normalize = (value: string): string => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

const toSlug = (value: string): string => {
  return normalize(value).replace(/\s+/g, '-');
};

const inferCountySlug = (city: string): string => {
  const citySlug = toSlug(city);
  const direct = counties.find((county) => county.slug === citySlug);
  if (direct) {
    return direct.slug;
  }

  const partial = counties.find((county) => citySlug.includes(county.slug) || county.slug.includes(citySlug));
  if (partial) {
    return partial.slug;
  }

  return 'bucuresti';
};

const facilityFromLabel = (value: string): Facility => {
  const normalized = normalize(value).replace(/\s+/g, '-');

  if (KNOWN_FACILITIES.has(normalized as Facility)) {
    return normalized as Facility;
  }

  if (normalized === 'wi-fi') {
    return 'wifi';
  }

  if (normalized === 'aer-conditionat') {
    return 'aer-conditionat';
  }

  if (normalized === 'roomservice') {
    return 'room-service';
  }

  return 'wifi';
};

const toProperty = (place: BackendPlace): Property => {
  const countySlug = inferCountySlug(place.city);
  const stars = Math.min(Math.max(place.stars || 0, 0), 5);

  return {
    id: String(place.id),
    name: place.title,
    type: 'pensiune',
    judetSlug: countySlug,
    city: place.city,
    address: place.city,
    priceMin: 0,
    priceMax: 0,
    rating: stars,
    reviewCount: 0,
    facilities: place.facilities.map(facilityFromLabel),
    mainImageUrl: place.photoUrl,
    images: [place.photoUrl],
    description: place.description,
    tagline: `${stars} stele`,
    phone: '',
    email: '',
    website: '',
    ownerId: String(place.ownerId),
    isApproved: place.isApproved
  };
};

const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Nu am putut încărca proprietățile.';
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [propertiesState, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hydrateFromApi = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const places = await fetchPlaces();
      setProperties(places.map(toProperty));
    } catch (err) {
      console.error('Failed to load places', err);
      setError(formatErrorMessage(err));
      setProperties(fallbackProperties);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void hydrateFromApi();
  }, [hydrateFromApi]);

  const refreshProperties = useCallback(async (): Promise<void> => {
    await hydrateFromApi();
  }, [hydrateFromApi]);

  const getPropertyById = useCallback((id: string): Property | undefined => {
    return propertiesState.find((property) => property.id === id);
  }, [propertiesState]);

  const getPropertiesByCounty = useCallback((judetSlug: string): Property[] => {
    return propertiesState.filter((property) => property.judetSlug === judetSlug && property.isApproved !== false);
  }, [propertiesState]);

  const getPropertiesByOwner = useCallback((ownerId: string): Property[] => {
    return propertiesState.filter((property) => property.ownerId === ownerId);
  }, [propertiesState]);

  const filterProperties = useCallback((judetSlug: string, filters: FilterOptions): Property[] => {
    let filtered = propertiesState.filter((property) => property.judetSlug === judetSlug && property.isApproved !== false);

    if (filters.type) {
      filtered = filtered.filter((property) => property.type === filters.type);
    }

    if (filters.priceMin !== undefined) {
      const priceMin = filters.priceMin;
      filtered = filtered.filter((property) => property.priceMax >= priceMin);
    }

    if (filters.priceMax !== undefined) {
      const priceMax = filters.priceMax;
      filtered = filtered.filter((property) => property.priceMin <= priceMax);
    }

    if (filters.rating !== undefined) {
      const rating = filters.rating;
      filtered = filtered.filter((property) => property.rating >= rating);
    }

    if (filters.facilities && filters.facilities.length > 0) {
      filtered = filtered.filter((property) => filters.facilities?.every((facility) => property.facilities.includes(facility)));
    }

    return filtered;
  }, [propertiesState]);

  const sortProperties = useCallback((properties: Property[], sortBy: SortOption): Property[] => {
    const sorted = [...properties];

    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.priceMin - b.priceMin);
      case 'price-desc':
        return sorted.sort((a, b) => b.priceMin - a.priceMin);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, []);

  const addProperty = useCallback(async (propertyData: Omit<Property, 'id'>): Promise<Property> => {
    const created = await createPlace({
      title: propertyData.name,
      description: propertyData.description,
      photoUrl: propertyData.mainImageUrl,
      stars: Math.round(propertyData.rating || 0),
      city: propertyData.city,
      facilities: propertyData.facilities
    });

    const mapped = toProperty(created);
    setProperties((prev) => [...prev, mapped]);
    return mapped;
  }, []);

  const updateProperty = useCallback(async (id: string, updates: Partial<Property>): Promise<void> => {
    const current = propertiesState.find((property) => property.id === id);
    if (!current) {
      return;
    }

    const next = { ...current, ...updates };
    const updated = await updatePlace(Number(id), {
      title: next.name,
      description: next.description,
      photoUrl: next.mainImageUrl,
      stars: Math.round(next.rating || 0),
      city: next.city,
      facilities: next.facilities
    });

    setProperties((prev) => prev.map((property) => (property.id === id ? toProperty(updated) : property)));
  }, [propertiesState]);

  const deleteProperty = useCallback(async (id: string): Promise<void> => {
    await deletePlace(Number(id));
    setProperties((prev) => prev.filter((property) => property.id !== id));
  }, []);

  const getCountyBySlug = useCallback((slug: string): County | undefined => {
    return counties.find((county) => county.slug === slug);
  }, []);

  const searchProperties = useCallback((query: string): Property[] => {
    const normalizedQuery = query.toLowerCase();
    return propertiesState.filter((property) =>
      property.name.toLowerCase().includes(normalizedQuery)
      || property.city.toLowerCase().includes(normalizedQuery)
      || property.description.toLowerCase().includes(normalizedQuery)
    );
  }, [propertiesState]);

  const value = useMemo<DataContextType>(() => ({
    properties: propertiesState,
    counties,
    isLoading,
    error,
    refreshProperties,
    getPropertyById,
    getPropertiesByCounty,
    getPropertiesByOwner,
    filterProperties,
    sortProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    getCountyBySlug,
    searchProperties
  }), [
    propertiesState,
    isLoading,
    error,
    refreshProperties,
    getPropertyById,
    getPropertiesByCounty,
    getPropertiesByOwner,
    filterProperties,
    sortProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    getCountyBySlug,
    searchProperties
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }

  return context;
}
