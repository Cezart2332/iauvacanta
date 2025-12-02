/**
 * MapRomania Component
 * 
 * A high-quality, interactive SVG map of Romania showing all 41 counties (județe) + București.
 * Features smooth hover animations, tooltips, and click navigation.
 * 
 * @example
 * <MapRomania onCountySelect={(slug) => console.log(slug)} />
 */

import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { romaniaCountyPaths, type CountyPath } from './map/romania-paths';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface MapRomaniaProps {
  /** Callback when a county is clicked */
  onCountySelect?: (slug: string) => void;
  /** Additional CSS classes for the container */
  className?: string;
  /** Show county names as tooltips on hover */
  showTooltip?: boolean;
  /** Currently active/selected county slug */
  activeCounty?: string;
  /** Custom colors (optional) */
  colors?: {
    base?: string;
    hover?: string;
    active?: string;
    stroke?: string;
    strokeHover?: string;
  };
}

// ============================================================================
// Default Configuration
// ============================================================================

const defaultColors = {
  base: 'rgba(15, 23, 42, 0.08)',
  hover: 'rgba(18, 86, 212, 0.18)',
  active: 'var(--brand-primary)',
  stroke: 'rgba(15, 23, 42, 0.2)',
  strokeHover: 'var(--brand-primary)',
};

// ============================================================================
// County Component (Memoized for performance)
// ============================================================================

interface CountyShapeProps {
  county: CountyPath;
  isHovered: boolean;
  isActive: boolean;
  colors: typeof defaultColors;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

function CountyShape({
  county,
  isHovered,
  isActive,
  colors,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: CountyShapeProps) {
  // Determine fill color based on state
  const fillColor = isActive 
    ? colors.active 
    : isHovered 
      ? colors.hover 
      : colors.base;
  
  const strokeColor = isHovered || isActive 
    ? colors.strokeHover 
    : colors.stroke;

  return (
    <path
      id={county.slug}
      data-county={county.slug}
      data-region={county.region}
      d={county.d}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={isHovered || isActive ? 1.5 : 1}
      className="cursor-pointer transition-all duration-200 ease-out origin-center"
      style={{
        transform: isHovered ? 'scale(1.015)' : 'scale(1)',
        filter: isActive 
          ? 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.4))' 
          : isHovered 
            ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' 
            : 'none',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Selectează județul ${county.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    />
  );
}

// ============================================================================
// Tooltip Component
// ============================================================================

interface TooltipProps {
  countyName: string;
  visible: boolean;
}

function Tooltip({ countyName, visible }: TooltipProps) {
  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center" role="presentation">
      <div className="rounded-2xl border border-white/50 bg-white/90 px-4 py-2.5 text-sm font-medium text-[var(--brand-ink)] shadow-[0_20px_40px_rgba(15,23,42,0.18)]">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {countyName}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main MapRomania Component
// ============================================================================

export function MapRomania({
  onCountySelect,
  className = '',
  showTooltip = true,
  activeCounty,
  colors: customColors,
}: MapRomaniaProps) {
  const navigate = useNavigate();
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);

  // Merge custom colors with defaults
  const colors = useMemo(() => ({
    ...defaultColors,
    ...customColors,
  }), [customColors]);

  // Get the name of the hovered county
  const hoveredCountyName = useMemo(() => {
    if (!hoveredCounty) return '';
    const county = romaniaCountyPaths.find(c => c.slug === hoveredCounty);
    return county?.name || '';
  }, [hoveredCounty]);

  const activeCountyName = useMemo(() => {
    if (!activeCounty) return '';
    const county = romaniaCountyPaths.find(c => c.slug === activeCounty);
    return county?.name || '';
  }, [activeCounty]);

  const selectedCounty = useMemo(() => {
    const slug = activeCounty || hoveredCounty;
    if (!slug) return null;
    return romaniaCountyPaths.find((c) => c.slug === slug) || null;
  }, [activeCounty, hoveredCounty]);

  // Handle county click
  const handleCountyClick = useCallback((slug: string) => {
    if (onCountySelect) {
      onCountySelect(slug);
    } else {
      navigate(`/locations/${slug}`);
    }
  }, [onCountySelect, navigate]);

  return (
    <div className={`relative w-full overflow-hidden rounded-[32px] bg-white/75 p-4 sm:p-6 shadow-[0_25px_60px_rgba(15,23,42,0.12)] ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="pattern-wave h-full w-full" />
      </div>

      <div className="relative">
        {showTooltip && (
          <Tooltip countyName={hoveredCountyName} visible={!!hoveredCounty} />
        )}

        <div className="relative mx-auto w-full max-w-4xl">
          <svg
            viewBox="0 0 700 600"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Harta interactivă a României"
          >
            <defs>
              <filter id="mapShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.1" />
              </filter>
            </defs>

            <g filter="url(#mapShadow)">
              {romaniaCountyPaths.map((county) => (
                <CountyShape
                  key={county.slug}
                  county={county}
                  isHovered={hoveredCounty === county.slug}
                  isActive={activeCounty === county.slug}
                  colors={colors}
                  onMouseEnter={() => setHoveredCounty(county.slug)}
                  onMouseLeave={() => setHoveredCounty(null)}
                  onClick={() => handleCountyClick(county.slug)}
                />
              ))}
            </g>

            <g className="pointer-events-none select-none">
              {romaniaCountyPaths.map((county) => (
                <text
                  key={`label-${county.slug}`}
                  x={county.labelX}
                  y={county.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="system-ui, sans-serif"
                  fill={hoveredCounty === county.slug || activeCounty === county.slug ? 'var(--brand-primary)' : '#374151'}
                  className="transition-colors duration-200"
                >
                  {county.abbr}
                </text>
              ))}
            </g>

            <g transform="translate(10, 555)">
              <rect
                x="0"
                y="0"
                width="185"
                height="36"
                rx="10"
                fill="white"
                fillOpacity="0.95"
                className="drop-shadow-sm"
              />
              <circle cx="18" cy="18" r="7" fill={colors.base} stroke={colors.stroke} strokeWidth="1" />
              <text x="32" y="22" fontSize="11" fill="#6B7280" fontFamily="system-ui, sans-serif">
                Click pe un județ pentru detalii
              </text>
            </g>

            <g transform="translate(650, 25)">
              <circle cx="18" cy="18" r="18" fill="white" fillOpacity="0.95" className="drop-shadow-sm" />
              <text x="18" y="23" fontSize="13" fill="#374151" textAnchor="middle" fontWeight="600">
                N
              </text>
              <path d="M18 6 L18 12" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
              <path d="M18 6 L15 10 L18 8 L21 10 Z" fill="#374151" />
            </g>
          </svg>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/60 bg-white/80 p-4 text-sm text-[var(--brand-slate)] sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">Județ selectat</p>
            <p className="mt-1 text-lg font-semibold text-[var(--brand-ink)]">
              {selectedCounty?.name || activeCountyName || 'Selectează pe hartă'}
            </p>
            {selectedCounty && (
              <p className="text-xs text-[var(--brand-slate)]/80">Regiune: {selectedCounty.region}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => selectedCounty && handleCountyClick(selectedCounty.slug)}
            disabled={!selectedCounty}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-[var(--brand-primary)]/30 px-4 py-2 font-semibold text-[var(--brand-primary)] transition hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-0"
          >
            Deschide cazările
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default MapRomania;
export type { MapRomaniaProps };
