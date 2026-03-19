import { Link } from 'react-router-dom';
import { FiArrowRight, FiHeart, FiStar } from 'react-icons/fi';
import { useAuth } from '../context';
import { type Property, propertyTypeLabels, facilityLabels } from '../mock/properties';

interface PropertyCardProps {
  property: Property;
  showFavorite?: boolean;
}

export function PropertyCard({ property, showFavorite = true }: PropertyCardProps) {
  const { isAuthenticated, isFavorite, toggleFavorite } = useAuth();
  const isFav = isFavorite(property.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      toggleFavorite(property.id);
    }
  };

  const displayFacilities = property.facilities.slice(0, 3);
  const hasPrice = property.priceMin > 0;

  return (
    <Link
      to={`/property/${property.id}`}
      className="group block overflow-hidden rounded-[30px] border border-white/60 bg-white/90 shadow-[0_30px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={property.mainImageUrl}
          alt={property.name}
          className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.8)] via-transparent to-transparent" />

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-slate)]">
            {propertyTypeLabels[property.type]}
          </span>
          {property.tagline && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-primary)]/90 px-3 py-1 text-xs font-semibold text-white">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
              {property.tagline}
            </span>
          )}
        </div>

        {showFavorite && isAuthenticated && (
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-white/80 text-[var(--brand-primary)] backdrop-blur-md transition ${
              isFav ? 'bg-[var(--brand-primary)] text-white' : 'hover:text-red-500'
            }`}
          >
            <FiHeart className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-slate)]/70">
              {property.city}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-[var(--brand-ink)] line-clamp-2 group-hover:text-[var(--brand-primary)]">
              {property.name}
            </h3>
          </div>
          <div className="rounded-2xl border border-white/50 bg-white/80 px-3 py-2 text-right">
            <div className="flex items-center justify-end gap-1">
              <FiStar className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold text-[var(--brand-ink)]">{property.rating}</span>
            </div>
            <p className="text-[11px] text-[var(--brand-slate)]/70">{property.reviewCount} recenzii</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {displayFacilities.map((facility) => (
            <span
              key={facility}
              className="rounded-full border border-[var(--brand-cloud)]/60 bg-white/80 px-3 py-1 text-xs font-medium text-[var(--brand-slate)]"
            >
              {facilityLabels[facility]}
            </span>
          ))}
          {property.facilities.length > displayFacilities.length && (
            <span className="rounded-full bg-[var(--brand-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
              +{property.facilities.length - displayFacilities.length}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between border-t border-white/60 pt-4">
          {hasPrice ? (
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-slate)]/60">de la</p>
              <p className="text-2xl font-semibold text-[var(--brand-ink)]">
                {property.priceMin} RON
                <span className="text-sm font-normal text-[var(--brand-slate)]"> / noapte</span>
              </p>
            </div>
          ) : (
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand-slate)]/70">
              Tarif la cerere
            </p>
          )}
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-primary)] group-hover:translate-x-1 transition-transform">
            Vezi detalii
            <FiArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
