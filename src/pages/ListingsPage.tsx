import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import { PropertyCard, FilterBar, type FilterState, type SortOption } from '../components';
import { useData } from '../context';

const ITEMS_PER_PAGE = 9;

export function ListingsPage() {
  const { judetSlug } = useParams<{ judetSlug: string }>();
  const {
    getPropertiesByCounty,
    getCountyBySlug,
    sortProperties,
    isLoading,
    error,
    refreshProperties,
  } = useData();

  const county = getCountyBySlug(judetSlug || '');
  const allProperties = getPropertiesByCounty(judetSlug || '');
  const countyHasListings = allProperties.length > 0;

  const [filters, setFilters] = useState<FilterState>({
    type: '',
    priceMin: 0,
    priceMax: 5000,
    rating: 0,
    facilities: [],
  });
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProperties = useMemo(() => {
    let filtered = [...allProperties];

    if (filters.type) {
      filtered = filtered.filter((p) => p.type === filters.type);
    }

    if (filters.priceMin > 0) {
      filtered = filtered.filter((p) => p.priceMax >= filters.priceMin);
    }
    if (filters.priceMax < 5000) {
      filtered = filtered.filter((p) => p.priceMin <= filters.priceMax);
    }

    if (filters.rating > 0) {
      filtered = filtered.filter((p) => p.rating >= filters.rating);
    }

    if (filters.facilities.length > 0) {
      filtered = filtered.filter((p) => filters.facilities.every((f) => p.facilities.includes(f)));
    }

    return sortProperties(filtered, sortBy);
  }, [allProperties, filters, sortBy, sortProperties]);

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetryFetch = useCallback(() => {
    void refreshProperties();
  }, [refreshProperties]);

  if (!county) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-sand)] px-4 py-24">
        <div className="surface-glass max-w-md p-8 text-center">
          <h1 className="text-2xl text-[var(--brand-ink)]">Județul nu există</h1>
          <p className="mt-3 text-[var(--brand-slate)]">Verifică link-ul sau revino pe pagina principală.</p>
          <Link to="/" className="btn-aurora mt-6 inline-flex text-xs uppercase tracking-[0.3em]">
            Înapoi acasă
          </Link>
        </div>
      </div>
    );
  }

  const ratedProperties = allProperties.filter((p) => p.rating > 0);
  const averageRating = ratedProperties.length
    ? (ratedProperties.reduce((acc, p) => acc + p.rating, 0) / ratedProperties.length).toFixed(1)
    : '0.0';

  const heroDescription = `Descoperă ${county.name} prin ${allProperties.length || '0'} spații boutique din ${county.region}, evaluate în medie la ${averageRating}/5.`;

  return (
    <div className="min-h-screen bg-[var(--brand-sand)] relative">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <span className="sr-only">Încărcăm proprietățile reale...</span>
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
      <section className="relative overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1422] via-[var(--brand-sand)] to-[#111c2d]" />
        <div className="absolute inset-0 pattern-wave opacity-40" />
        <div className="absolute right-[-10%] top-10 h-72 w-72 rounded-full bg-aurora opacity-10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-[var(--brand-slate)]">
            <ol className="flex items-center gap-2 text-[var(--brand-slate)]/70">
              <li>
                <Link to="/" className="hover:text-[var(--brand-ink)]">Acasă</Link>
              </li>
              <li>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li className="font-semibold text-[var(--brand-ink)]">{county.name}</li>
            </ol>
          </nav>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--brand-slate)]/70">Colecția pentru județ</p>
              <h1 className="mt-4 text-4xl text-[var(--brand-ink)] md:text-5xl">{county.name}</h1>
              <p className="mt-4 text-lg text-[var(--brand-slate)]">
                {heroDescription}
              </p>

              <dl className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/20 bg-white/8 backdrop-blur-xl p-4 shadow-[0_14px_30px_rgba(2,6,23,0.45)]">
                  <dt className="text-xs uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">Proprietăți</dt>
                  <dd className="mt-2 text-2xl font-semibold text-[var(--brand-ink)]">{allProperties.length}+</dd>
                </div>
                <div className="rounded-3xl border border-white/20 bg-white/8 backdrop-blur-xl p-4 shadow-[0_14px_30px_rgba(2,6,23,0.45)]">
                  <dt className="text-xs uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">Rating mediu</dt>
                  <dd className="mt-2 text-2xl font-semibold text-[var(--brand-ink)]">{averageRating}</dd>
                </div>
                <div className="rounded-3xl border border-white/20 bg-white/8 backdrop-blur-xl p-4 shadow-[0_14px_30px_rgba(2,6,23,0.45)]">
                  <dt className="text-xs uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">Regiune</dt>
                  <dd className="mt-2 text-2xl font-semibold text-[var(--brand-ink)]">{county.region}</dd>
                </div>
              </dl>
            </div>

            <div className="surface-glass glass-ring halo p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--brand-slate)]/70">Minighid local</p>
              <h2 className="mt-3 text-2xl text-[var(--brand-ink)]">Top experiențe</h2>
              <ul className="mt-4 space-y-3 text-sm text-[var(--brand-slate)]">
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="mt-0.5 h-4 w-4 text-[var(--brand-primary)]" />
                  <span>Recomandări culinare și trasee create de gazdele din zonă.</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="mt-0.5 h-4 w-4 text-[var(--brand-primary)]" />
                  <span>Harta cu cafenele, galerii și zone de hiking.</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="mt-0.5 h-4 w-4 text-[var(--brand-primary)]" />
                  <span>Concierge digital: mesaje directe cu proprietarii.</span>
                </li>
              </ul>
              <Link to="/register" className="btn-outline-glow mt-6 inline-flex text-xs uppercase tracking-[0.3em]">
                Primește itinerarul
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-10 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FilterBar
            currentFilters={filters}
            currentSort={sortBy}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
          />

          <div className="mt-8 flex flex-col gap-2 text-sm text-[var(--brand-slate)] md:flex-row md:items-center md:justify-between">
            <p>
              {!countyHasListings
                ? `Încă nu avem locații publicate în ${county.name}. Revenim curând cu gazde verificate.`
                : filteredProperties.length === 0
                  ? 'Momentan nu avem proprietăți care să corespundă filtrelor tale.'
                  : filteredProperties.length === 1
                    ? 'O singură proprietate se potrivește filtrării tale.'
                    : `${filteredProperties.length} proprietăți curatoriate pentru criteriile selectate.`}
            </p>
            {filteredProperties.length > 0 && (
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">
                Pagina {currentPage} / {totalPages || 1}
              </p>
            )}
          </div>

          {filteredProperties.length === 0 ? (
            countyHasListings ? (
              <div className="mt-10 rounded-[40px] border border-dashed border-white/25 bg-white/8 p-10 text-center shadow-[0_18px_35px_rgba(2,6,23,0.5)] backdrop-blur-xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 8v8m4-4H8" />
                  </svg>
                </div>
                <h3 className="mt-4 text-2xl text-[var(--brand-ink)]">Încă nu avem potriviri.</h3>
                <p className="mt-2 text-[var(--brand-slate)]">
                  Ajustează filtrele sau resetează-le pentru a vedea întreaga colecție.
                </p>
                <button
                  onClick={() => handleFilterChange({ type: '', priceMin: 0, priceMax: 5000, rating: 0, facilities: [] })}
                  className="btn-aurora mt-6 text-xs uppercase tracking-[0.3em]"
                >
                  Șterge filtrele
                </button>
              </div>
            ) : (
              <div className="mt-10 rounded-[40px] border border-dashed border-white/25 bg-white/8 p-10 text-center shadow-[0_18px_35px_rgba(2,6,23,0.5)] backdrop-blur-xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="mt-4 text-2xl text-[var(--brand-ink)]">Lucrăm la colecția din {county.name}.</h3>
                <p className="mt-2 text-[var(--brand-slate)]">
                  Migrația datelor istorice încă este în derulare pentru acest județ. Îți poți planifica vacanța într-o altă zonă între timp.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link to="/" className="btn-aurora text-xs uppercase tracking-[0.3em]">
                    Vezi toate județele
                  </Link>
                  <button
                    type="button"
                    onClick={handleRetryFetch}
                    className="btn-outline-glow text-xs uppercase tracking-[0.3em]"
                  >
                    Reîncarcă datele
                  </button>
                </div>
              </div>
            )
          ) : (
            <>
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-2xl border border-white/70 px-4 py-2 text-sm font-semibold text-[var(--brand-slate)] transition hover:border-white hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`h-10 w-10 rounded-2xl text-sm font-semibold transition ${
                        currentPage === page
                          ? 'bg-[var(--brand-primary)] text-white shadow-[0_15px_30px_rgba(18,86,212,0.3)]'
                          : 'text-[var(--brand-slate)] hover:bg-white/70'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-2xl border border-white/70 px-4 py-2 text-sm font-semibold text-[var(--brand-slate)] transition hover:border-white hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
