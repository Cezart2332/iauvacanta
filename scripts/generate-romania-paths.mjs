import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';
import { geoMercator, geoPath } from 'd3-geo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const topoPath = path.resolve(__dirname, '../src/assets/maps/ro-all.topo.json');
const outputPath = path.resolve(__dirname, './generated-romania-counties.json');
const appDataPath = path.resolve(__dirname, '../src/components/map/romania-counties.json');

const REGION_MAP = {
  'alba': 'transilvania',
  'arad': 'banat',
  'arges': 'muntenia',
  'bacau': 'moldova',
  'bihor': 'crisana-maramures',
  'bistrita-nasaud': 'transilvania',
  'botosani': 'moldova',
  'brasov': 'transilvania',
  'braila': 'moldova',
  'buzau': 'muntenia',
  'caras-severin': 'banat',
  'calarasi': 'muntenia',
  'cluj': 'transilvania',
  'constanta': 'dobrogea',
  'covasna': 'transilvania',
  'dambovita': 'muntenia',
  'dolj': 'oltenia',
  'galati': 'moldova',
  'giurgiu': 'muntenia',
  'gorj': 'oltenia',
  'harghita': 'transilvania',
  'hunedoara': 'transilvania',
  'ialomita': 'muntenia',
  'iasi': 'moldova',
  'ilfov': 'muntenia',
  'maramures': 'crisana-maramures',
  'mehedinti': 'oltenia',
  'mures': 'transilvania',
  'neamt': 'moldova',
  'olt': 'oltenia',
  'prahova': 'muntenia',
  'satu-mare': 'crisana-maramures',
  'salaj': 'crisana-maramures',
  'sibiu': 'transilvania',
  'suceava': 'moldova',
  'teleorman': 'muntenia',
  'timis': 'banat',
  'tulcea': 'dobrogea',
  'vaslui': 'moldova',
  'valcea': 'oltenia',
  'vrancea': 'moldova',
  'bucuresti': 'bucuresti'
};

const SLUG_OVERRIDE = {
  'Bucharest': 'bucuresti'
};

const NAME_OVERRIDE = {
  'Bucharest': 'București',
  'Caras-Severin': 'Caraș-Severin',
  'Timis': 'Timiș',
  'Bistrita-Nasaud': 'Bistrița-Năsăud',
  'Mures': 'Mureș',
  'Maramures': 'Maramureș',
  'Salaj': 'Sălaj',
  'Arges': 'Argeș',
  'Valcea': 'Vâlcea',
  'Brasov': 'Brașov',
  'Galati': 'Galați',
  'Iasi': 'Iași',
  'Neamt': 'Neamț',
  'Bacau': 'Bacău',
  'Braila': 'Brăila',
  'Buzau': 'Buzău',
  'Calarasi': 'Călărași',
  'Dambovita': 'Dâmbovița',
  'Ialomita': 'Ialomița',
  'Mehedinti': 'Mehedinți',
  'Botosani': 'Botoșani',
  'Constanta': 'Constanța'
};

const ABBR_OVERRIDE = {
  'bucuresti': 'B'
};

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const topology = JSON.parse(readFileSync(topoPath, 'utf8'));
const geojson = feature(topology, topology.objects.default);

const projection = geoMercator().fitSize([700, 600], geojson);
const pathGenerator = geoPath(projection);

const counties = geojson.features.map((feature) => {
  const rawName = feature.properties?.name ?? 'Unknown';
  const name = NAME_OVERRIDE[rawName] ?? rawName;
  const slug = SLUG_OVERRIDE[rawName] ?? slugify(name);
  const pathData = pathGenerator(feature);

  if (!pathData) {
    throw new Error(`Failed to generate path for ${name}`);
  }

  const [labelX, labelY] = pathGenerator.centroid(feature);
  const abbr = ABBR_OVERRIDE[slug] ?? feature.properties?.['hc-a2'] ?? name.slice(0, 2).toUpperCase();
  const region = REGION_MAP[slug] ?? 'transilvania';

  return {
    slug,
    name,
    abbr,
    region,
    d: pathData,
    labelX: Number(labelX.toFixed(2)),
    labelY: Number(labelY.toFixed(2))
  };
});

const serialized = JSON.stringify(counties, null, 2);
writeFileSync(outputPath, serialized);
writeFileSync(appDataPath, serialized);
console.log(`Generated ${counties.length} county paths -> ${outputPath}`);
console.log(`Synced dataset to ${appDataPath}`);
