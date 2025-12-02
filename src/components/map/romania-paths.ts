import romaniaCountyData from './romania-counties.json';

/**
 * County path definition for the interactive Romania map.
 * Geometry is auto-generated from high-precision TopoJSON via scripts/generate-romania-paths.mjs
 * and stored in romania-counties.json so this module focuses on typing and helpers.
 */
export interface CountyPath {
  slug: string;
  name: string;
  abbr: string;
  d: string;
  labelX: number;
  labelY: number;
  region: 'moldova' | 'muntenia' | 'oltenia' | 'transilvania' | 'banat' | 'crisana-maramures' | 'dobrogea' | 'bucuresti';
}

/**
 * Strongly typed county dataset consumed by the MapRomania component.
 * Cast is safe because the JSON is generated from trusted geo tooling.
 */
export const romaniaCountyPaths: CountyPath[] = romaniaCountyData as CountyPath[];

/**
 * Get county by slug.
 */
export function getCountyPathBySlug(slug: string): CountyPath | undefined {
  return romaniaCountyPaths.find((county) => county.slug === slug);
}

/**
 * Get all counties that belong to the provided region.
 */
export function getCountyPathsByRegion(region: CountyPath['region']): CountyPath[] {
  return romaniaCountyPaths.filter((county) => county.region === region);
}
