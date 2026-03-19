import { useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiStar } from 'react-icons/fi';
import { BookingModal } from '../components';
import { useData, useAuth } from '../context';
import { facilityLabels, propertyTypeLabels } from '../mock/properties';

const facilityIcons: Record<string, ReactNode> = {
  'wifi': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>,
  'parcare': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
  'mic-dejun': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
  'piscină': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  'restaurant': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  'spa': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  'aer-conditionat': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  'animale': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  'fitness': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  'room-service': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  'bar': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  'terasă': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  'grătar': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>,
  'jacuzzi': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  'saună': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>,
};

export function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { getPropertyById, getCountyBySlug } = useData();
  const { isAuthenticated, isFavorite, toggleFavorite } = useAuth();
  
  const property = getPropertyById(id || '');
  const county = property ? getCountyBySlug(property.judetSlug) : undefined;
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  if (!property) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Proprietatea nu a fost găsită</h1>
          <p className="text-gray-600 mb-6">Ne pare rău, nu am găsit proprietatea căutată.</p>
          <Link to="/" className="btn-primary">
            Înapoi la pagina principală
          </Link>
        </div>
      </div>
    );
  }

  const isFav = isFavorite(property.id);
  const hasPriceRange = property.priceMin > 0 || property.priceMax > 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.92)_0%,_rgba(235,244,255,0.82)_35%,_rgba(223,234,250,0.72)_100%)] pt-20">
      {/* Breadcrumb */}
      <div className="border-b border-white/70 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav>
            <ol className="flex items-center gap-2 text-sm text-gray-500">
              <li>
                <Link to="/" className="hover:text-blue-600 transition-colors">Acasă</Link>
              </li>
              <li>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li>
                <Link to={`/locations/${property.judetSlug}`} className="hover:text-blue-600 transition-colors">
                  {county?.name}
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li className="text-gray-900 font-medium truncate max-w-[200px]">{property.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="surface-glass glass-ring overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={property.images[selectedImageIndex] || property.mainImageUrl}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Favorite button */}
                {isAuthenticated && (
                  <button
                    onClick={() => toggleFavorite(property.id)}
                    className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                      isFav 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/90 backdrop-blur-sm text-[var(--brand-slate)] hover:text-red-500'
                    }`}
                  >
                    <svg 
                      className="w-6 h-6" 
                      fill={isFav ? 'currentColor' : 'none'} 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                )}

                {/* Type badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-sm font-medium text-gray-700 rounded-full shadow-sm">
                    {propertyTypeLabels[property.type]}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {property.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {property.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                        selectedImageIndex === index
                          ? 'ring-2 ring-blue-600 ring-offset-2'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title and info */}
            <div className="surface-glass glass-ring p-6">
              <div className="flex flex-wrap gap-4 items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {property.name}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-500">
                    <FiMapPin className="w-5 h-5" />
                    <span>{property.city}, {county?.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl">
                  <FiStar className="w-6 h-6 text-amber-400" />
                  <span className="text-xl font-bold text-gray-900">{property.rating}</span>
                  <span className="text-gray-500">({property.reviewCount} recenzii)</span>
                </div>
              </div>

              {property.tagline && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-4">
                  {property.tagline}
                </span>
              )}

              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Facilities */}
            <div className="surface-glass glass-ring p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Facilități</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.facilities.map((facility) => (
                  <div
                    key={facility}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      {facilityIcons[facility] || (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-gray-700">{facilityLabels[facility]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="surface-glass glass-ring p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Locație</h2>
              <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>Hartă interactivă</p>
                  <p className="text-sm">{property.address}, {property.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price card */}
            <div className="surface-glass glass-ring p-6 sticky top-24">
              <div className="mb-6">
                <span className="text-sm text-gray-500">Preț per noapte</span>
                {hasPriceRange ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">{property.priceMin}</span>
                    <span className="text-lg text-gray-500">-</span>
                    <span className="text-3xl font-bold text-gray-900">{property.priceMax}</span>
                    <span className="text-lg text-gray-500">RON</span>
                  </div>
                ) : (
                  <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Tarif disponibil la cerere
                  </p>
                )}
              </div>

              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="btn-accent w-full mb-4"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Solicită rezervare
                </span>
              </button>

              <p className="text-sm text-gray-500 text-center mb-6">
                Nu vei fi taxat încă
              </p>

              <div className="border-t border-gray-100 pt-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Contact</h3>
                
                <a
                  href={`tel:${property.phone}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">{property.phone}</span>
                </a>

                <a
                  href={`mailto:${property.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700 truncate">{property.email}</span>
                </a>

                {property.website && (
                  <a
                    href={`https://${property.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span className="text-gray-700 truncate">{property.website}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        propertyName={property.name}
        propertyId={property.id}
      />
    </div>
  );
}
