import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { properties as initialProperties, type Property, type PropertyType, type Facility } from '../mock/properties';
import { counties, type County } from '../mock/counties';
import { fetchVisiblePensiuni, type LegacyPensiune } from '../services/pensiuni';

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
  addProperty: (property: Omit<Property, 'id'>) => Property;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  getCountyBySlug: (slug: string) => County | undefined;
  searchProperties: (query: string) => Property[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&auto=format&fit=crop';
const FALLBACK_DESCRIPTION = 'Această proprietate face parte din arhiva iauvacanța și în curând va avea o prezentare completă.';

const LEGACY_FACILITY_MAP: Record<string, Facility> = {
  '111': 'saună',
  '112': 'fitness',
  '113': 'spa',
  '115': 'bar',
  '117': 'restaurant',
  '118': 'aer-conditionat',
  '120': 'jacuzzi',
  '121': 'terasă',
  '126': 'room-service',
  '130': 'terasă',
  '131': 'grătar',
};

const buildReviewCount = (rating: number | null): number => {
  if (!rating || rating <= 0) {
    return 0;
  }
  return Math.max(8, Math.round(rating * 18));
};

const mapLegacyFacilities = (facilityIds: string[]): Facility[] => {
  if (!Array.isArray(facilityIds) || facilityIds.length === 0) {
    return [];
  }

  const deduped = new Set<Facility>();
  facilityIds.forEach((id) => {
    const mapped = LEGACY_FACILITY_MAP[id];
    if (mapped) {
      deduped.add(mapped);
    }
  });

  return Array.from(deduped.values());
};

const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Nu am putut încărca proprietățile. Încercați din nou.';
};

const mapLegacyPensiuneToProperty = (legacy: LegacyPensiune): Property => {
  const countySlug = legacy.location.countySlug ?? 'necunoscut';
  const city = legacy.location.localityName ?? legacy.location.countyName ?? 'România';
  const priceMin = legacy.price.min ?? legacy.price.max ?? 0;
  const priceMax = legacy.price.max ?? legacy.price.min ?? priceMin;
  const images = legacy.photos.length > 0 ? legacy.photos : [FALLBACK_IMAGE];

  return {
    id: `legacy-${legacy.id}`,
    name: legacy.name,
    type: 'pensiune',
    judetSlug: countySlug,
    city,
    address: legacy.address ?? city,
    priceMin,
    priceMax,
    rating: legacy.rating ?? 0,
    reviewCount: buildReviewCount(legacy.rating),
    facilities: mapLegacyFacilities(legacy.facilityIds),
    mainImageUrl: images[0] ?? FALLBACK_IMAGE,
    images,
    description: legacy.description ?? FALLBACK_DESCRIPTION,
    tagline: legacy.type.label ?? city,
    phone: legacy.phone ?? '',
    email: legacy.email ?? '',
    website: '',
    ownerId: legacy.ownerName ?? `legacy-owner-${legacy.id}`,
  };
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [propertiesState, setProperties] = useState<Property[]>(initialProperties);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const hydrateFromApi = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchVisiblePensiuni({ limit: 150 });
      if (!isMountedRef.current) {
        return;
      }

      if (!response || !Array.isArray(response.data)) {
        throw new Error('Datele pensiunilor nu au putut fi interpretate.');
      }

      const normalized = response.data.map(mapLegacyPensiuneToProperty);
      setProperties(normalized);
    } catch (err) {
      if (!isMountedRef.current) {
        return;
      }
      console.error('Failed to load pensiuni', err);
      setError(formatErrorMessage(err));
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    hydrateFromApi();

    return () => {
      isMountedRef.current = false;
    };
  }, [hydrateFromApi]);

  const refreshProperties = useCallback(async () => {
    await hydrateFromApi();
  }, [hydrateFromApi]);

  const getPropertyById = useCallback((id: string): Property | undefined => {
    return propertiesState.find(p => p.id === id);
  }, [propertiesState]);

  const getPropertiesByCounty = useCallback((judetSlug: string): Property[] => {
    return propertiesState.filter(p => p.judetSlug === judetSlug);
  }, [propertiesState]);

  const getPropertiesByOwner = useCallback((ownerId: string): Property[] => {
    return propertiesState.filter(p => p.ownerId === ownerId);
  }, [propertiesState]);

  const filterProperties = useCallback((judetSlug: string, filters: FilterOptions): Property[] => {
    let filtered = propertiesState.filter(p => p.judetSlug === judetSlug);

    if (filters.type) {
      filtered = filtered.filter(p => p.type === filters.type);
    }

    if (filters.priceMin !== undefined) {
      filtered = filtered.filter(p => p.priceMax >= filters.priceMin!);
    }

    if (filters.priceMax !== undefined) {
      filtered = filtered.filter(p => p.priceMin <= filters.priceMax!);
    }

    if (filters.rating !== undefined) {
      filtered = filtered.filter(p => p.rating >= filters.rating!);
    }

    if (filters.facilities && filters.facilities.length > 0) {
      filtered = filtered.filter(p => 
        filters.facilities!.every(f => p.facilities.includes(f))
      );
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

  const addProperty = useCallback((propertyData: Omit<Property, 'id'>): Property => {
    const newProperty: Property = {
      ...propertyData,
      id: `prop-${Date.now()}`,
    };
    setProperties(prev => [...prev, newProperty]);
    return newProperty;
  }, []);

  const updateProperty = useCallback((id: string, updates: Partial<Property>) => {
    setProperties(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  }, []);

  const deleteProperty = useCallback((id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  }, []);

  const getCountyBySlug = useCallback((slug: string): County | undefined => {
    return counties.find(c => c.slug === slug);
  }, []);

  const searchProperties = useCallback((query: string): Property[] => {
    const lowerQuery = query.toLowerCase();
    return propertiesState.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.city.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    );
  }, [propertiesState]);

  return (
    <DataContext.Provider value={{
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
      searchProperties,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
