import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { PropertyCard } from '../components';
import { useAuth, useData } from '../context';

export function TravelerDashboard() {
  const { currentUser, isAuthenticated, updateProfile } = useAuth();
  const { getPropertyById } = useData();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
  });

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== 'traveler') {
    return <Navigate to="/dashboard/owner" replace />;
  }

  const favoriteProperties = currentUser.favorites
    .map(id => getPropertyById(id))
    .filter(Boolean);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(editForm);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bună, {currentUser.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Bine ai venit în panoul tău de control
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Favorites section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Favorite ({favoriteProperties.length})
                </h2>
                <Link to="/locations/brasov" className="text-blue-600 hover:underline text-sm font-medium">
                  Descoperă mai multe →
                </Link>
              </div>

              {favoriteProperties.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Nicio proprietate favorită</h3>
                  <p className="text-gray-500 mb-4">
                    Explorează destinațiile și salvează proprietățile care îți plac
                  </p>
                  <Link to="/" className="btn-primary">
                    Explorează destinații
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {favoriteProperties.map((property) => (
                    property && <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </div>

            {/* Recent searches / recommendations placeholder */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Destinații recomandate
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Brașov', slug: 'brasov', img: 'https://images.unsplash.com/photo-1580809361436-42a7ec204889?w=300' },
                  { name: 'Constanța', slug: 'constanta', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300' },
                  { name: 'Cluj', slug: 'cluj', img: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=300' },
                  { name: 'Sibiu', slug: 'sibiu', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300' },
                ].map((dest) => (
                  <Link
                    key={dest.slug}
                    to={`/locations/${dest.slug}`}
                    className="group relative h-32 rounded-xl overflow-hidden"
                  >
                    <img
                      src={dest.img}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-3 left-3 text-white font-medium">
                      {dest.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Profile */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-900">Profilul meu</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {isEditing ? 'Anulează' : 'Editează'}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-100"
                      />
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label">Nume</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={currentUser.email}
                      disabled
                      className="input-field bg-gray-50 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="label">Telefon</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-field"
                      placeholder="+40 7XX XXX XXX"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    Salvează modificările
                  </button>
                </form>
              ) : (
                <div className="text-center">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-100 mx-auto mb-4"
                  />
                  <h3 className="text-lg font-semibold text-gray-900">{currentUser.name}</h3>
                  <p className="text-gray-500">{currentUser.email}</p>
                  {currentUser.phone && (
                    <p className="text-gray-500 text-sm mt-1">{currentUser.phone}</p>
                  )}
                  
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex justify-around text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{currentUser.favorites.length}</div>
                        <div className="text-sm text-gray-500">Favorite</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">0</div>
                        <div className="text-sm text-gray-500">Rezervări</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-xs text-gray-400">
                    Membru din {new Date(currentUser.createdAt).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Acțiuni rapide</h2>
              <div className="space-y-2">
                <Link
                  to="/"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700">Caută cazare</span>
                </Link>
                <a
                  href="#"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700">Ajutor & Suport</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
