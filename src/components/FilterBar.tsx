import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FiChevronDown, FiStar } from 'react-icons/fi';
import { type PropertyType, type Facility, propertyTypeLabels, facilityLabels } from '../mock/properties';

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  onSortChange: (sort: SortOption) => void;
  currentFilters: FilterState;
  currentSort: SortOption;
}

export interface FilterState {
  type: PropertyType | '';
  priceMin: number;
  priceMax: number;
  rating: number;
  facilities: Facility[];
}

export type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'name';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'rating', label: 'Rating (cel mai bun)' },
  { value: 'price-asc', label: 'Preț: mic → mare' },
  { value: 'price-desc', label: 'Preț: mare → mic' },
  { value: 'name', label: 'Nume A-Z' },
];

const allFacilities: Facility[] = [
  'wifi', 'parcare', 'mic-dejun', 'piscină', 'restaurant', 
  'spa', 'aer-conditionat', 'animale', 'fitness', 'room-service',
  'bar', 'terasă', 'grătar', 'jacuzzi', 'saună'
];

export function FilterBar({ onFilterChange, onSortChange, currentFilters, currentSort }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTypeChange = (type: PropertyType | '') => {
    onFilterChange({ ...currentFilters, type });
  };

  const handlePriceMinChange = (value: string) => {
    onFilterChange({ ...currentFilters, priceMin: Number(value) || 0 });
  };

  const handlePriceMaxChange = (value: string) => {
    onFilterChange({ ...currentFilters, priceMax: Number(value) || 5000 });
  };

  const handleRatingChange = (rating: number) => {
    onFilterChange({ 
      ...currentFilters, 
      rating: currentFilters.rating === rating ? 0 : rating 
    });
  };

  const handleFacilityToggle = (facility: Facility) => {
    const newFacilities = currentFilters.facilities.includes(facility)
      ? currentFilters.facilities.filter(f => f !== facility)
      : [...currentFilters.facilities, facility];
    onFilterChange({ ...currentFilters, facilities: newFacilities });
  };

  const clearFilters = () => {
    onFilterChange({
      type: '',
      priceMin: 0,
      priceMax: 5000,
      rating: 0,
      facilities: [],
    });
  };

  const hasActiveFilters = 
    currentFilters.type !== '' ||
    currentFilters.priceMin > 0 ||
    currentFilters.priceMax < 5000 ||
    currentFilters.rating > 0 ||
    currentFilters.facilities.length > 0;

  return (
    <div className="surface-glass glass-ring halo rounded-[32px] border border-white/20 p-5 md:p-6 space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {[{ label: 'Toate', value: '' }, ...(Object.keys(propertyTypeLabels) as PropertyType[]).map((type) => ({ label: propertyTypeLabels[type], value: type }))].map((option) => {
            const active = currentFilters.type === option.value;
            return (
              <button
                key={option.value || 'all'}
                onClick={() => handleTypeChange(option.value as PropertyType | '')}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? 'border-transparent bg-aurora text-white shadow-[0_15px_35px_rgba(18,86,212,0.25)]'
                    : 'border-white/20 bg-white/10 text-[var(--brand-slate)] hover:bg-white/15'
                }`}
                aria-pressed={active}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-[var(--brand-slate)]">
          <span className="uppercase tracking-[0.3em] text-[10px] text-[var(--brand-slate)]/70">Sortare</span>
          <select
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-transparent text-[var(--brand-ink)] outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/20 pt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-semibold text-[var(--brand-ink)]"
        >
          <FiChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          {isExpanded ? 'Ascunde filtrele' : 'Filtre avansate'}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm font-semibold text-red-500 hover:text-red-600"
          >
            Resetează tot
          </button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="grid grid-cols-1 gap-6 border-t border-white/40 pt-6 md:grid-cols-3"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.22 }}
          >
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">
              Interval de preț (RON/noapte)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Min"
                value={currentFilters.priceMin || ''}
                onChange={(e) => handlePriceMinChange(e.target.value)}
                className="input-field py-2"
                min={0}
              />
              <span className="text-[var(--brand-slate)]/50">—</span>
              <input
                type="number"
                placeholder="Max"
                value={currentFilters.priceMax >= 5000 ? '' : currentFilters.priceMax}
                onChange={(e) => handlePriceMaxChange(e.target.value)}
                className="input-field py-2"
                min={0}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">
              Rating minim
            </label>
            <div className="flex flex-wrap gap-2">
              {[3, 3.5, 4, 4.5].map((rating) => {
                const active = currentFilters.rating === rating;
                return (
                  <button
                    key={rating}
                    onClick={() => handleRatingChange(rating)}
                    className={`flex items-center gap-1 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? 'border-transparent bg-amber-400/20 text-amber-100 shadow-[0_10px_25px_rgba(255,183,77,0.25)]'
                        : 'border-white/20 bg-white/10 text-[var(--brand-slate)] hover:bg-white/15'
                    }`}
                    aria-pressed={active}
                  >
                    <FiStar className="h-4 w-4 text-amber-400" />
                    {rating}+
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 md:col-span-3">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">
              Facilități
            </label>
            <div className="flex flex-wrap gap-2">
              {allFacilities.map((facility) => {
                const active = currentFilters.facilities.includes(facility);
                return (
                  <button
                    key={facility}
                    onClick={() => handleFacilityToggle(facility)}
                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                      active
                        ? 'border-transparent bg-[var(--brand-primary)]/90 text-white shadow-[0_15px_30px_rgba(18,86,212,0.25)]'
                        : 'border-white/20 bg-white/10 text-[var(--brand-slate)] hover:bg-white/15'
                    }`}
                  >
                    {facilityLabels[facility]}
                  </button>
                );
              })}
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
