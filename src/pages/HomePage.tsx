import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapRomania, PropertyCard } from '../components';
import { useData } from '../context';

const popularDestinations = [
  {
    slug: 'brasov',
    name: 'Brașov',
    image: 'https://images.unsplash.com/photo-1580809361436-42a7ec204889?w=600',
    description: 'Munte și natură',
    propertyCount: 150,
  },
  {
    slug: 'constanta',
    name: 'Constanța',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    description: 'Plajă și soare',
    propertyCount: 200,
  },
  {
    slug: 'cluj',
    name: 'Cluj-Napoca',
    image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600',
    description: 'Cultură și viață de noapte',
    propertyCount: 120,
  },
  {
    slug: 'sibiu',
    name: 'Sibiu',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    description: 'Istorie și tradiție',
    propertyCount: 80,
  },
];

const features = [
  {
    label: 'Rezervări sigure',
    description: 'Fiecare proprietate este verificată manual și are suport 24/7.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    label: 'Experiențe curate',
    description: 'Selectăm doar gazde cu scor peste 4.5 și recenzii autentice.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M14 10h4.764a2 2 0 011.789 2.894l-1.382 3.105A4 4 0 0115.47 18H8.53a4 4 0 01-3.701-2.001L3.447 12.89A2 2 0 015.236 10H10m4 0V6a2 2 0 10-4 0v4m4 0H10" />
      </svg>
    ),
  },
  {
    label: 'Itinerarii locale',
    description: 'Descoperă recomandări scrise de localnici pentru fiecare județ.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 20l-5.447-2.724A2 2 0 013 15.447V5.618a2 2 0 011.106-1.789l6-3a2 2 0 011.788 0l6 3A2 2 0 0119 5.618v9.83a2 2 0 01-1.106 1.789L12 20m0 0v-9" />
      </svg>
    ),
  },
  {
    label: 'Echilibru perfect',
    description: 'Casual sau luxury, găsim spații potrivite fiecărui tip de călător.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 3v18h18" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M7 13l3-3 4 4 6-6" />
      </svg>
    ),
  },
];

const statHighlights = [
  { label: 'Proprietăți boutique', value: '500+' },
  { label: 'Județe acoperite', value: '42' },
  { label: 'Experiențe curatoriate', value: '120+' },
  { label: 'Rating mediu', value: '4.8' },
];

export function HomePage() {
  const { properties, counties, isLoading, error, refreshProperties } = useData();
  const location = useLocation();
  const [mapHighlighted, setMapHighlighted] = useState(false);
  const mapSectionRef = useRef<HTMLElement | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const [activeCountySlug, setActiveCountySlug] = useState<string | null>(null);

  const countiesWithInventory = useMemo(() => {
    const result = new Set<string>();
    properties.forEach((property) => {
      if (property.judetSlug) {
        result.add(property.judetSlug);
      }
    });
    return result;
  }, [properties]);

  const countiesBySlug = useMemo(() => {
    return counties.reduce<Record<string, typeof counties[number]>>((acc, county) => {
      acc[county.slug] = county;
      return acc;
    }, {});
  }, [counties]);

  const countyDestinations = useMemo(() => {
    type Destination = {
      slug: string;
      name: string;
      region: string;
      description: string;
      propertyCount: number;
      image: string;
    };

    const grouped = new Map<string, Destination>();

    properties.forEach((property) => {
      if (!property.judetSlug) {
        return;
      }
      const slug = property.judetSlug;
      const county = countiesBySlug[slug];
      const coverImage = property.images[0] || property.mainImageUrl;
      const existing = grouped.get(slug);
      if (existing) {
        existing.propertyCount += 1;
        if (!existing.image && coverImage) {
          existing.image = coverImage;
        }
      } else {
        grouped.set(slug, {
          slug,
          name: county?.name ?? slug,
          region: county?.region ?? 'România',
          description: `${property.city}${county ? ` • ${county.region}` : ''}`,
          propertyCount: 1,
          image: coverImage,
        });
      }
    });

    return Array.from(grouped.values()).sort((a, b) => b.propertyCount - a.propertyCount);
  }, [properties, countiesBySlug]);

  const destinations = useMemo(() => {
    if (countyDestinations.length > 0) {
      return countyDestinations;
    }

    return popularDestinations.map((dest) => ({
      slug: dest.slug,
      name: dest.name,
      region: dest.description,
      description: dest.description,
      propertyCount: dest.propertyCount,
      image: dest.image,
    }));
  }, [countyDestinations]);

  const scrollToMapSection = useCallback(() => {
    const element = mapSectionRef.current;
    if (!element) return;

    const offset = 140;
    const elementTop = element.getBoundingClientRect().top + window.scrollY;
    const target = Math.max(elementTop - offset, 0);
    window.scrollTo({ top: target, behavior: 'smooth' });
  }, []);

  const triggerMapHighlight = useCallback(() => {
    setMapHighlighted(true);
    if (highlightTimerRef.current) {
      window.clearTimeout(highlightTimerRef.current);
    }
    highlightTimerRef.current = window.setTimeout(() => setMapHighlighted(false), 1200);
  }, []);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (destinations.length === 0) {
      setActiveCountySlug(null);
      return;
    }

    if (!activeCountySlug) {
      return;
    }

    const activeExists = destinations.some((dest) => dest.slug === activeCountySlug);
    if (!activeExists) {
      setActiveCountySlug(null);
    }
  }, [destinations, activeCountySlug]);

  useEffect(() => {
    const handleMapFocus = () => {
      scrollToMapSection();
      triggerMapHighlight();
    };

    window.addEventListener('map-focus', handleMapFocus);
    return () => window.removeEventListener('map-focus', handleMapFocus);
  }, [scrollToMapSection, triggerMapHighlight]);

  useEffect(() => {
    if (location.hash === '#map') {
      requestAnimationFrame(() => {
        scrollToMapSection();
        triggerMapHighlight();
      });
    }
  }, [location.hash, scrollToMapSection, triggerMapHighlight]);
  const featuredProperties = properties.filter((p) => p.rating >= 4.5).slice(0, 4);
  const heroHighlight = featuredProperties[0];
  const heroHighlightImage = heroHighlight?.images?.[0] ?? 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800';
  const heroHighlightDescription = heroHighlight?.description ?? '';
  const heroDescriptionIsTruncated = heroHighlightDescription.length > 180;
  const heroDescriptionSnippet = heroDescriptionIsTruncated
    ? `${heroHighlightDescription.slice(0, 180).trim()}…`
    : heroHighlightDescription;
  const curatedCollection = featuredProperties.slice(1, 3);
  const activeDestination = destinations.find((dest) => dest.slug === activeCountySlug);


  const handleSidebarSelect = useCallback((slug: string) => {
    setActiveCountySlug(slug);
  }, []);

  const handleMapCountySelect = useCallback((slug: string) => {
    setActiveCountySlug(slug);
  }, []);

  const handleMapResetFocus = useCallback(() => {
    setActiveCountySlug(null);
  }, []);

  const handleRetryFetch = useCallback(() => {
    void refreshProperties();
  }, [refreshProperties]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <span className="sr-only">Încărcăm colecția din arhiva iauvacanța...</span>
          <span
            aria-hidden
            className="inline-block h-12 w-12 animate-spin rounded-full border-2 border-[var(--brand-primary)] border-t-transparent"
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 px-4 py-3 text-center text-sm text-red-900">
          <span>{error}</span>
          <button
            type="button"
            onClick={handleRetryFetch}
            className="ml-3 inline-flex text-xs font-semibold uppercase tracking-[0.3em] text-red-700"
          >
            Reîncearcă
          </button>
        </div>
      )}
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-sand)] via-white to-[#f5f2ec]" />
        <div className="absolute inset-0 pattern-wave opacity-50" />
        <div className="absolute -right-20 top-16 h-72 w-72 rounded-full bg-aurora opacity-20 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:px-8 lg:grid-cols-[1.15fr_.85fr]">
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--brand-slate)]/70">Colecția 2025</p>
              <h1 className="text-4xl leading-[1.05] text-[var(--brand-ink)] md:text-5xl lg:text-6xl">
                Refă-ți ritualul de călătorie cu spații curate și gazde atent selectate.
              </h1>
              <p className="text-lg text-[var(--brand-slate)]">
                Inspirăm vacanțe memorabile cu recomandări locale, hărți interactive și proprietăți boutique în toate județele României.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to={{ pathname: '/', hash: '#map' }} className="btn-aurora text-sm uppercase tracking-[0.3em]">
                Explorează destinații
              </Link>
              <Link to="/register" className="btn-outline-glow text-sm uppercase tracking-[0.3em]">
                Devino gazdă
              </Link>
            </div>

            <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {statHighlights.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-white/50 bg-white/70 p-4 text-center">
                  <dt className="text-xs uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">{stat.label}</dt>
                  <dd className="mt-2 text-2xl font-semibold text-[var(--brand-ink)]">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="space-y-4">
            {heroHighlight && (
              <Link
                to={`/property/${heroHighlight.id}`}
                className="surface-glass glass-ring block rounded-[32px] p-6 shadow-[0_25px_60px_rgba(15,23,42,0.15)]"
              >
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-3xl">
                    <img src={heroHighlightImage} alt={heroHighlight?.name} className="h-56 w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30" />
                    <span className="absolute left-5 top-5 inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-slate)]">
                      Highlight
                    </span>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-slate)]/60">Selecția editorului</p>
                    <h3 className="mt-2 text-2xl text-[var(--brand-ink)]">{heroHighlight?.name}</h3>
                    {heroHighlight && (
                      <p className="text-sm text-[var(--brand-slate)]">{heroHighlight.city}, {heroHighlight.judetSlug}</p>
                    )}
                    <p className="mt-3 text-sm text-[var(--brand-slate)]">
                      {heroDescriptionSnippet}
                    </p>
                    {heroHighlight && heroDescriptionIsTruncated && (
                      <Link
                        to={`/property/${heroHighlight.id}`}
                        className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-primary)]"
                      >
                        Află mai multe detalii
                      </Link>
                    )}
                  </div>
                </div>
              </Link>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {curatedCollection.map((property) => (
                <Link
                  key={property.id}
                  to={`/property/${property.id}`}
                  className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.12)] transition hover:-translate-y-1"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-slate)]/60">Colecție boutique</p>
                  <h4 className="mt-2 text-lg text-[var(--brand-ink)]">{property.name}</h4>
                  <p className="text-sm text-[var(--brand-slate)]">{property.city}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-[var(--brand-slate)]">
                    <span>
                      {property.priceMin > 0 ? `${property.priceMin}€ / noapte` : 'Tarif la cerere'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg className="h-4 w-4 text-[var(--brand-primary)]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      {property.rating}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[var(--brand-sand)] py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--brand-slate)]/70">Manifest</p>
            <h2 className="mt-4 text-3xl text-[var(--brand-ink)] md:text-4xl">Un nou limbaj pentru vacanțe în România</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.label} className="rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-[0_18px_35px_rgba(15,23,42,0.08)]">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                  {feature.icon}
                </div>
                <h3 className="text-xl text-[var(--brand-ink)]">{feature.label}</h3>
                <p className="mt-2 text-[var(--brand-slate)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map & Destinations */}
      <section
        id="map"
        ref={mapSectionRef}
        style={{ scrollMarginTop: '160px' }}
        className={`py-16 md:py-20 ${mapHighlighted ? 'map-highlight' : ''}`}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[var(--brand-slate)]/70">Explorează harta</p>
                  {activeDestination && (
                    <p className="mt-1 text-sm text-[var(--brand-slate)]">
                      {activeDestination.name} • {activeDestination.propertyCount}+ cazări curate
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[var(--brand-slate)]">
                  {destinations.length || counties.length} județe
                </span>
              </div>
              <MapRomania
                activeCounty={activeCountySlug ?? undefined}
                onCountySelect={handleMapCountySelect}
                onResetFocus={handleMapResetFocus}
                canNavigateToCounty={(slug) => countiesWithInventory.has(slug)}
              />
            </div>

            <div className="space-y-6">
              <div className="rounded-[32px] border border-white/50 bg-white/80 p-6 shadow-[0_18px_35px_rgba(15,23,42,0.08)]">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--brand-slate)]/70">Destinații populare</p>
                <div className="mt-4 space-y-4">
                  {destinations.slice(0, 5).map((dest) => {
                    const isActive = dest.slug === activeCountySlug;
                    return (
                      <div
                        key={dest.slug}
                        className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
                          isActive
                            ? 'border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5 shadow-[0_15px_30px_rgba(18,86,212,0.12)]'
                            : 'border-transparent hover:border-[var(--brand-primary)]/15 hover:bg-white'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSidebarSelect(dest.slug)}
                          className="flex flex-1 items-center gap-4 text-left"
                        >
                          <img src={dest.image} alt={dest.name} className="h-16 w-16 rounded-2xl object-cover" />
                          <div className="flex-1">
                            <p className="text-sm uppercase tracking-[0.3em] text-[var(--brand-slate)]/60">{dest.region}</p>
                            <h4 className="text-lg text-[var(--brand-ink)]">{dest.name}</h4>
                            <p className="text-sm text-[var(--brand-slate)]">{dest.propertyCount}+ cazări</p>
                          </div>
                        </button>
                        <Link
                          to={`/locations/${dest.slug}`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--brand-slate)]/20 text-[var(--brand-slate)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                        >
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[32px] border border-white/50 bg-white/80 p-6 shadow-[0_18px_35px_rgba(15,23,42,0.08)]">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--brand-slate)]/70">Itinerar personalizat</p>
                <p className="mt-3 text-[var(--brand-slate)]">
                  Spune-ne mood-ul tău și îți trimitem o listă curatoriată cu trei proprietăți, experiențe locale și restaurante de testat.
                </p>
                <Link to="/register" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-primary)]">
                  Cere recomandări
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured properties */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--brand-slate)]/70">Colecția editorului</p>
              <h2 className="mt-3 text-3xl text-[var(--brand-ink)] md:text-4xl">Cazări de top alese manual</h2>
              <p className="mt-2 text-[var(--brand-slate)]">Proprietăți evaluate peste 4.5 din toată țara.</p>
            </div>
            <Link to={{ pathname: '/', hash: '#map' }} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-primary)]">
              Vezi toate destinațiile
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden rounded-t-[48px] bg-[var(--brand-ink)] py-16 text-white md:py-20">
        <div className="absolute inset-0 opacity-30">
          <div className="pattern-wave h-full w-full" />
        </div>
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Gazde atente</p>
          <h2 className="text-3xl md:text-4xl">Listează-ți proprietatea într-o platformă curatoriată</h2>
          <p className="max-w-2xl text-white/80">
            Îți oferim mentorat pentru descrieri, ședințe foto, recomandări de preț și acces la o comunitate activă de călători premium.
          </p>
          <Link to="/register" className="btn-aurora text-sm uppercase tracking-[0.3em]">
            Începe colaborarea
          </Link>
        </div>
      </section>
    </div>
  );
}
