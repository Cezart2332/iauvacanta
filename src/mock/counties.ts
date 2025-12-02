export interface County {
  slug: string;
  name: string;
  region: string;
}

export const counties: County[] = [
  { slug: 'alba', name: 'Alba', region: 'Transilvania' },
  { slug: 'arad', name: 'Arad', region: 'Banat' },
  { slug: 'arges', name: 'Argeș', region: 'Muntenia' },
  { slug: 'bacau', name: 'Bacău', region: 'Moldova' },
  { slug: 'bihor', name: 'Bihor', region: 'Crișana' },
  { slug: 'bistrita-nasaud', name: 'Bistrița-Năsăud', region: 'Transilvania' },
  { slug: 'botosani', name: 'Botoșani', region: 'Moldova' },
  { slug: 'brasov', name: 'Brașov', region: 'Transilvania' },
  { slug: 'braila', name: 'Brăila', region: 'Muntenia' },
  { slug: 'bucuresti', name: 'București', region: 'București-Ilfov' },
  { slug: 'buzau', name: 'Buzău', region: 'Muntenia' },
  { slug: 'caras-severin', name: 'Caraș-Severin', region: 'Banat' },
  { slug: 'calarasi', name: 'Călărași', region: 'Muntenia' },
  { slug: 'cluj', name: 'Cluj', region: 'Transilvania' },
  { slug: 'constanta', name: 'Constanța', region: 'Dobrogea' },
  { slug: 'covasna', name: 'Covasna', region: 'Transilvania' },
  { slug: 'dambovita', name: 'Dâmbovița', region: 'Muntenia' },
  { slug: 'dolj', name: 'Dolj', region: 'Oltenia' },
  { slug: 'galati', name: 'Galați', region: 'Moldova' },
  { slug: 'giurgiu', name: 'Giurgiu', region: 'Muntenia' },
  { slug: 'gorj', name: 'Gorj', region: 'Oltenia' },
  { slug: 'harghita', name: 'Harghita', region: 'Transilvania' },
  { slug: 'hunedoara', name: 'Hunedoara', region: 'Transilvania' },
  { slug: 'ialomita', name: 'Ialomița', region: 'Muntenia' },
  { slug: 'iasi', name: 'Iași', region: 'Moldova' },
  { slug: 'ilfov', name: 'Ilfov', region: 'București-Ilfov' },
  { slug: 'maramures', name: 'Maramureș', region: 'Maramureș' },
  { slug: 'mehedinti', name: 'Mehedinți', region: 'Oltenia' },
  { slug: 'mures', name: 'Mureș', region: 'Transilvania' },
  { slug: 'neamt', name: 'Neamț', region: 'Moldova' },
  { slug: 'olt', name: 'Olt', region: 'Oltenia' },
  { slug: 'prahova', name: 'Prahova', region: 'Muntenia' },
  { slug: 'satu-mare', name: 'Satu Mare', region: 'Crișana' },
  { slug: 'salaj', name: 'Sălaj', region: 'Transilvania' },
  { slug: 'sibiu', name: 'Sibiu', region: 'Transilvania' },
  { slug: 'suceava', name: 'Suceava', region: 'Bucovina' },
  { slug: 'teleorman', name: 'Teleorman', region: 'Muntenia' },
  { slug: 'timis', name: 'Timiș', region: 'Banat' },
  { slug: 'tulcea', name: 'Tulcea', region: 'Dobrogea' },
  { slug: 'vaslui', name: 'Vaslui', region: 'Moldova' },
  { slug: 'valcea', name: 'Vâlcea', region: 'Oltenia' },
  { slug: 'vrancea', name: 'Vrancea', region: 'Moldova' },
];

export const getCountyBySlug = (slug: string): County | undefined => {
  return counties.find(c => c.slug === slug);
};

export const getCountiesByRegion = (region: string): County[] => {
  return counties.filter(c => c.region === region);
};
