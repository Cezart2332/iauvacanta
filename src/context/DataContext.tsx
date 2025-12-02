import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { properties as initialProperties, type Property, type PropertyType, type Facility } from '../mock/properties';
import { counties, type County } from '../mock/counties';

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

export function DataProvider({ children }: { children: ReactNode }) {
  const [propertiesState, setProperties] = useState<Property[]>(initialProperties);

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
